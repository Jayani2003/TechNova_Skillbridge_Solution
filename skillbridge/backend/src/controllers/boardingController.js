const db = require('../config/db');

exports.getAllBoardings = async (req, res) => {
  const { maxPrice, maxDistance, facility, rooms } = req.query;

  let query = `
    SELECT b.*, u.full_name as poster_name, u.profile_image as poster_image
    FROM boarding b
    JOIN users u ON b.poster_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (maxPrice) {
    query += ' AND b.price <= ?';
    params.push(parseFloat(maxPrice));
  }

  if (maxDistance) {
    query += ' AND b.distance_from_faculty <= ?';
    params.push(parseFloat(maxDistance));
  }

  if (rooms) {
    query += ' AND b.rooms_count >= ?';
    params.push(parseInt(rooms));
  }

  query += ' ORDER BY b.created_at DESC';

  try {
    const [rows] = await db.query(query, params);
    
    // Client-side facility filtering if requested
    let filtered = rows;
    if (facility) {
      const facilityList = Array.isArray(facility) ? facility : [facility];
      filtered = rows.filter(b => {
        const facs = b.facilities.split(',').map(f => f.trim().toLowerCase());
        return facilityList.every(f => facs.includes(f.trim().toLowerCase()));
      });
    }

    res.json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving boarding listings.' });
  }
};

exports.getBoardingById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT b.*, u.full_name as poster_name, u.email as poster_email, u.phone as poster_phone, u.profile_image as poster_image
       FROM boarding b
       JOIN users u ON b.poster_id = u.id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Boarding listing not found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving boarding details.' });
  }
};

exports.createBoarding = async (req, res) => {
  const { title, description, price, location, distance_from_faculty, available_date, rooms_count, facilities, contact_method, latitude, longitude } = req.body;
  const posterId = req.user.id;

  if (req.user.user_type !== 'COMMUNITY_MEMBER') {
    return res.status(403).json({ message: 'Only community members can list boarding facilities.' });
  }

  if (!title || !description || !price || !location || !distance_from_faculty || !available_date || !contact_method) {
    return res.status(400).json({ message: 'Please enter all required boarding fields.' });
  }

  try {
    const facilitiesStr = Array.isArray(facilities) ? facilities.join(',') : (facilities || '');
    
    await db.query(
      `INSERT INTO boarding (poster_id, title, description, price, location, distance_from_faculty, available_date, rooms_count, facilities, contact_method, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [posterId, title, description, price, location, distance_from_faculty, available_date, rooms_count || 1, facilitiesStr, contact_method, latitude || 6.0535, longitude || 80.5332]
    );

    res.status(201).json({ message: 'Boarding listing created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating boarding listing.' });
  }
};

exports.deleteBoarding = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [check] = await db.query('SELECT poster_id FROM boarding WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Boarding listing not found.' });
    }
    if (check[0].poster_id !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this listing.' });
    }

    await db.query('DELETE FROM boarding WHERE id = ?', [id]);
    res.json({ message: 'Boarding listing deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting boarding listing.' });
  }
};
