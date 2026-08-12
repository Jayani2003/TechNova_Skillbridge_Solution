const db = require('../config/db');
const { calculateDistance } = require('../utils/matching');

exports.getAllResources = async (req, res) => {
  const { category, type, search } = req.query;

  let query = `
    SELECT r.*, u.full_name as owner_name, u.profile_image as owner_image, u.phone as owner_phone
    FROM resources r
    JOIN users u ON r.owner_id = u.id
    WHERE r.status = 'AVAILABLE'
  `;
  const params = [];

  if (category) {
    query += ' AND r.category = ?';
    params.push(category);
  }

  if (type) {
    query += ' AND r.type = ?';
    params.push(type);
  }

  if (search) {
    query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY r.created_at DESC';

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving resources.' });
  }
};

exports.getResourceById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone, u.profile_image as owner_image
       FROM resources r
       JOIN users u ON r.owner_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const resource = rows[0];

    // Resource Matching Engine
    // If the resource is a REQUEST, find matching DONATIONS.
    // If the resource is a DONATION, find matching REQUESTS.
    const searchType = resource.type === 'REQUEST' ? 'DONATION' : 'REQUEST';
    
    const [matchCandidates] = await db.query(
      `SELECT r.*, u.full_name as owner_name, u.phone as owner_phone
       FROM resources r
       JOIN users u ON r.owner_id = u.id
       WHERE r.type = ? AND r.status = 'AVAILABLE'`,
      [searchType]
    );

    const matches = matchCandidates.map(candidate => {
      // Calculate keyword relevance: fraction of matching words in title
      const titleWords1 = resource.title.toLowerCase().split(/\s+/);
      const titleWords2 = candidate.title.toLowerCase().split(/\s+/);
      const matchWords = titleWords1.filter(w => w.length > 2 && titleWords2.includes(w));
      
      const relevance = matchWords.length;
      const distance = calculateDistance(resource.latitude, resource.longitude, candidate.latitude, candidate.longitude);

      return {
        ...candidate,
        relevance,
        distance: parseFloat(distance.toFixed(2))
      };
    });

    // Rank by relevance (descending) and then distance (ascending)
    matches.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return a.distance - b.distance;
    });

    // Return top 5 matches
    resource.matches = matches.filter(m => m.relevance > 0 || m.distance < 10).slice(0, 5);

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving resource details.' });
  }
};

exports.createResource = async (req, res) => {
  const { title, description, category, item_condition, type, location, latitude, longitude } = req.body;
  const ownerId = req.user.id;

  if (!title || !description || !category || !type || !location) {
    return res.status(400).json({ message: 'Please enter all required fields.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [resRow] = await connection.query(
      `INSERT INTO resources (owner_id, title, description, category, item_condition, status, type, location, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, 'AVAILABLE', ?, ?, ?, ?)`,
      [ownerId, title, description, category, item_condition || 'Good', type, location, latitude || 6.0535, longitude || 80.5332]
    );
    const newResourceId = resRow.insertId;

    // Trigger instant alert if matching item exists!
    const searchType = type === 'REQUEST' ? 'DONATION' : 'REQUEST';
    const [matches] = await connection.query(
      `SELECT r.id, r.title, r.owner_id FROM resources r 
       WHERE r.type = ? AND r.status = 'AVAILABLE' AND (r.title LIKE ? OR r.description LIKE ?)`,
      [searchType, `%${title}%`, `%${title}%`]
    );

    if (matches.length > 0) {
      if (type === 'REQUEST') {
        // Notify the requester that matching donations are ready!
        await connection.query(
          `INSERT INTO notifications (user_id, title, content)
           VALUES (?, 'Matching Resources Found!', ?)`,
          [ownerId, `We found ${matches.length} matching available resource donation(s) for your request "${title}". Click to view details.`]
        );
      } else {
        // It is a donation. Notify the people who requested this item!
        for (let reqMatch of matches) {
          await connection.query(
            `INSERT INTO notifications (user_id, title, content)
             VALUES (?, 'Requested Resource Available!', ?)`,
            [reqMatch.owner_id, `Someone has donated "${title}", which matches your active resource request. Contact the donor!`]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({ id: newResourceId, message: 'Resource exchange item posted successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error creating resource item.' });
  } finally {
    connection.release();
  }
};

exports.updateResourceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'AVAILABLE', 'DONATED', 'RECLAIMED'
  const userId = req.user.id;

  if (status !== 'AVAILABLE' && status !== 'DONATED' && status !== 'RECLAIMED') {
    return res.status(400).json({ message: 'Invalid status update.' });
  }

  try {
    const [check] = await db.query(
      `SELECT r.owner_id, r.title, r.type, u.full_name as current_user_name 
       FROM resources r 
       JOIN users u ON u.id = ? 
       WHERE r.id = ?`, 
      [userId, id]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const resource = check[0];
    const isOwner = resource.owner_id === userId;

    // Allow status change if user is the owner OR if any authenticated user is claiming/fulfilling an available item to 'DONATED'
    if (!isOwner && status !== 'DONATED') {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }

    await db.query('UPDATE resources SET status = ? WHERE id = ?', [status, id]);
    
    // Send a notification to the resource owner if fulfilled by another community member
    if (status === 'DONATED' && !isOwner) {
      const notifTitle = resource.type === 'REQUEST' ? 'Resource Request Fulfilled!' : 'Donation Claimed!';
      const notifContent = resource.type === 'REQUEST' 
        ? `${resource.current_user_name} has fulfilled your request for "${resource.title}".`
        : `${resource.current_user_name} has claimed your donation of "${resource.title}".`;

      await db.query(
        `INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)`,
        [resource.owner_id, notifTitle, notifContent]
      );
    }

    res.json({ message: 'Resource status updated successfully.' });
  } catch (error) {
    console.error('Error updating resource status:', error);
    res.status(500).json({ message: 'Error updating resource status.' });
  }
};
