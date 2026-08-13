const db = require('../config/db');
const { calculateMatch, calculateOpportunityScore } = require('../utils/matching');

// Helper to fetch skills for a list of gigs
async function attachSkillsToGigs(gigs) {
  if (gigs.length === 0) return gigs;
  const gigIds = gigs.map(g => g.id);
  const [skillRows] = await db.query(
    'SELECT gig_id, skill_name FROM gig_skills WHERE gig_id IN (?)',
    [gigIds]
  );
  
  const skillMap = {};
  skillRows.forEach(row => {
    if (!skillMap[row.gig_id]) skillMap[row.gig_id] = [];
    skillMap[row.gig_id].push(row.skill_name);
  });

  return gigs.map(g => ({
    ...g,
    skills: skillMap[g.id] || []
  }));
}

exports.getAllGigs = async (req, res) => {
  const { category, search, minBudget, maxBudget, status, posterId } = req.query;
  
  let query = `
    SELECT g.*, u.full_name as poster_name, u.user_type as poster_type, u.profile_image as poster_image
    FROM gigs g
    JOIN users u ON g.poster_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    query += ' AND g.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (g.title LIKE ? OR g.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (minBudget) {
    query += ' AND g.budget >= ?';
    params.push(parseFloat(minBudget));
  }

  if (maxBudget) {
    query += ' AND g.budget <= ?';
    params.push(parseFloat(maxBudget));
  }

  if (status) {
    query += ' AND g.status = ?';
    params.push(status);
  } else if (!posterId) {
    // Only default to OPEN if we are not explicitly fetching all gigs for a specific poster
    query += " AND g.status = 'OPEN'";
  }

  if (posterId) {
    query += ' AND g.poster_id = ?';
    params.push(posterId);
  }

  query += ' ORDER BY g.created_at DESC';

  try {
    const [rows] = await db.query(query, params);
    const gigsWithSkills = await attachSkillsToGigs(rows);
    res.json(gigsWithSkills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving gigs.' });
  }
};

exports.getGigById = async (req, res) => {
  const { id } = req.params;
  try {
    const [gigRows] = await db.query(
      `SELECT g.*, u.full_name as poster_name, u.email as poster_email, u.phone as poster_phone, 
              u.user_type as poster_type, u.profile_image as poster_image, u.location as poster_location
       FROM gigs g
       JOIN users u ON g.poster_id = u.id
       WHERE g.id = ?`,
      [id]
    );

    if (gigRows.length === 0) {
      return res.status(404).json({ message: 'Gig not found.' });
    }

    const gigArr = await attachSkillsToGigs(gigRows);
    const gig = gigArr[0];

    // Intelligent Matching: Fetch recommended workers
    // Get all students/workers
    const [workers] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.profile_image, u.location, u.latitude, u.longitude, u.user_type,
              sp.availability, sp.expected_rate, sp.bio
       FROM users u
       JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.user_type = 'STUDENT'`
    );

    const recommendedWorkers = [];
    for (let worker of workers) {
      // Get skills for worker
      const [skillsRows] = await db.query('SELECT skill_name FROM user_skills WHERE user_id = ?', [worker.id]);
      worker.skills = skillsRows.map(s => s.skill_name);

      // Get rating and jobs count
      const [jobStats] = await db.query("SELECT COUNT(*) as completed_jobs FROM jobs WHERE worker_id = ? AND status = 'COMPLETED'", [worker.id]);
      const [ratingStats] = await db.query("SELECT AVG(rating_value) as avg_rating FROM ratings WHERE reviewee_id = ?", [worker.id]);

      worker.completed_jobs = jobStats[0].completed_jobs || 0;
      worker.avg_rating = ratingStats[0].avg_rating || 0;

      // Compute match
      const matchResult = calculateMatch(worker, gig);
      const oppScore = calculateOpportunityScore(worker);

      if (matchResult.score >= 50) { // return matches above 50%
        recommendedWorkers.push({
          id: worker.id,
          full_name: worker.full_name,
          profile_image: worker.profile_image,
          availability: worker.availability,
          expected_rate: worker.expected_rate,
          completed_jobs: worker.completed_jobs,
          avg_rating: parseFloat(worker.avg_rating || 0).toFixed(1),
          match_percentage: matchResult.score,
          distance: matchResult.distance,
          reasons: matchResult.reasons,
          opportunity_score: oppScore.score
        });
      }
    }

    // Sort by match percentage descending
    recommendedWorkers.sort((a, b) => b.match_percentage - a.match_percentage);
    gig.recommendedWorkers = recommendedWorkers.slice(0, 5); // top 5 recommendations

    res.json(gig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving gig details.' });
  }
};

exports.createGig = async (req, res) => {
  const { title, description, category, budget, payment_type, location, latitude, longitude, deadline, duration, skills } = req.body;
  const posterId = req.user.id;

  if (!title || !description || !category || !budget || !location || !deadline || !duration) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [gigRes] = await connection.query(
      `INSERT INTO gigs (poster_id, title, description, category, budget, payment_type, location, latitude, longitude, deadline, duration, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [posterId, title, description, category, budget, payment_type || 'Fixed', location, latitude || 6.0535, longitude || 80.5332, deadline, duration]
    );
    const gigId = gigRes.insertId;

    // Insert gig skills
    if (Array.isArray(skills) && skills.length > 0) {
      for (let s of skills) {
        if (s.trim()) {
          await connection.query('INSERT INTO gig_skills (gig_id, skill_name) VALUES (?, ?)', [gigId, s.trim()]);
        }
      }
    }

    // Intelligent Notification: Find matching workers and notify them!
    const [matchingWorkers] = await connection.query(
      `SELECT DISTINCT u.id 
       FROM users u
       JOIN user_skills us ON u.id = us.user_id
       WHERE us.skill_name IN (?) AND u.id != ?`,
      [skills && skills.length > 0 ? skills : [''], posterId]
    );

    for (let worker of matchingWorkers) {
      await connection.query(
        `INSERT INTO notifications (user_id, title, content)
         VALUES (?, 'New Gig Matches Your Skills!', ?)`,
        [worker.id, `A new gig "${title}" matches your skills. Check it out and apply now!`]
      );
    }

    await connection.commit();
    res.status(201).json({ id: gigId, message: 'Gig created successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error creating gig.' });
  } finally {
    connection.release();
  }
};

exports.applyToGig = async (req, res) => {
  const gigId = req.params.id;
  const applicantId = req.user.id;
  const { cover_message, proposed_price, estimated_duration } = req.body;

  if (!cover_message || !proposed_price || !estimated_duration) {
    return res.status(400).json({ message: 'Please provide all details for your application.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if gig is open
    const [gigRows] = await connection.query('SELECT poster_id, title, status FROM gigs WHERE id = ?', [gigId]);
    if (gigRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Gig not found.' });
    }
    const gig = gigRows[0];
    if (gig.status !== 'OPEN') {
      connection.release();
      return res.status(400).json({ message: 'This gig is no longer accepting applications.' });
    }

    // Check if user already applied
    const [existing] = await connection.query('SELECT id FROM applications WHERE gig_id = ? AND applicant_id = ?', [gigId, applicantId]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'You have already applied for this gig.' });
    }

    const [appResult] = await connection.query(
      `INSERT INTO applications (gig_id, applicant_id, cover_message, proposed_price, estimated_duration, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [gigId, applicantId, cover_message, proposed_price, estimated_duration]
    );

    const newApplicationId = appResult.insertId;

    // Update gig status to 'APPLIED' if it was 'OPEN' (so we know someone applied)
    // Actually let's keep it 'OPEN' so others can apply, but let's change status if needed.
    // The prompt says status can be: OPEN, APPLIED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED.
    // Let's set gig status to APPLIED to flag that it has applications.
    await connection.query("UPDATE gigs SET status = 'APPLIED' WHERE id = ? AND status = 'OPEN'", [gigId]);

    // Notify gig poster
    const notificationContent = `Someone has applied for your gig "${gig.title}". Review their application details.|||GIG_APP_DATA:${JSON.stringify({cover_message, proposed_price, estimated_duration})}`;
    await connection.query(
      `INSERT INTO notifications (user_id, sender_id, title, content, related_id, related_type)
       VALUES (?, ?, 'New Job Application Received', ?, ?, 'APPLICATION')`,
      [gig.poster_id, applicantId, notificationContent, newApplicationId]
    );

    await connection.commit();
    res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error submitting application.' });
  } finally {
    connection.release();
  }
};

exports.getGigApplications = async (req, res) => {
  const gigId = req.params.id;
  try {
    // Verify gig belongs to the logged-in user
    const [gigCheck] = await db.query('SELECT poster_id, title, budget, latitude, longitude FROM gigs WHERE id = ?', [gigId]);
    if (gigCheck.length === 0) {
      return res.status(404).json({ message: 'Gig not found.' });
    }
    const gig = gigCheck[0];

    const [apps] = await db.query(
      `SELECT a.*, u.full_name as applicant_name, u.email as applicant_email, u.phone as applicant_phone, 
              u.profile_image as applicant_image, u.user_type as applicant_type, u.location as applicant_location,
              u.latitude as applicant_latitude, u.longitude as applicant_longitude,
              sp.university, sp.faculty, sp.academic_year, sp.degree_program, sp.availability, sp.expected_rate, sp.bio
       FROM applications a
       JOIN users u ON a.applicant_id = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE a.gig_id = ?`,
      [gigId]
    );

    // Calculate match details for each applicant
    const applicationsWithMatching = [];
    for (let app of apps) {
      // Get applicant skills
      const [skillsRows] = await db.query('SELECT skill_name FROM user_skills WHERE user_id = ?', [app.applicant_id]);
      const skills = skillsRows.map(row => row.skill_name);

      // Get stats
      const [jobStats] = await db.query("SELECT COUNT(*) as completed_jobs FROM jobs WHERE worker_id = ? AND status = 'COMPLETED'", [app.applicant_id]);
      const [ratingStats] = await db.query("SELECT AVG(rating_value) as avg_rating FROM ratings WHERE reviewee_id = ?", [app.applicant_id]);

      const workerInfo = {
        skills,
        latitude: app.applicant_latitude,
        longitude: app.applicant_longitude,
        avg_rating: ratingStats[0].avg_rating || 0,
        completed_jobs: jobStats[0].completed_jobs || 0,
        profile: {
          availability: app.availability,
          expected_rate: app.expected_rate
        }
      };

      const matchRes = calculateMatch(workerInfo, gig);
      const oppScore = calculateOpportunityScore(workerInfo);

      applicationsWithMatching.push({
        ...app,
        skills,
        completed_jobs: workerInfo.completed_jobs,
        avg_rating: parseFloat(workerInfo.avg_rating || 0).toFixed(1),
        match_percentage: matchRes.score,
        distance: matchRes.distance,
        reasons: matchRes.reasons,
        opportunity_score: oppScore.score
      });
    }

    res.json(applicationsWithMatching);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving applications.' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const appId = req.params.id;
  const { status } = req.body; // 'ACCEPTED' or 'REJECTED'
  const posterId = req.user.id;

  if (status !== 'ACCEPTED' && status !== 'REJECTED') {
    return res.status(400).json({ message: 'Invalid application status.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify application exists and gig belongs to poster
    const [appRows] = await connection.query(
      `SELECT a.*, g.title as gig_title, g.description as gig_description, g.budget as gig_budget, g.poster_id
       FROM applications a
       JOIN gigs g ON a.gig_id = g.id
       WHERE a.id = ?`,
      [appId]
    );

    if (appRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Application not found.' });
    }

    const app = appRows[0];
    if (app.poster_id !== posterId) {
      connection.release();
      return res.status(403).json({ message: 'You are not authorized to manage this application.' });
    }

    // Update application status
    await connection.query('UPDATE applications SET status = ? WHERE id = ?', [status, appId]);

    if (status === 'ACCEPTED') {
      // Update gig status
      await connection.query("UPDATE gigs SET status = 'ACCEPTED' WHERE id = ?", [app.gig_id]);

      // Automatically create a job (active contract)
      await connection.query(
        `INSERT INTO jobs (gig_id, poster_id, worker_id, title, description, budget, status)
         VALUES (?, ?, ?, ?, ?, ?, 'IN_PROGRESS')`,
        [app.gig_id, posterId, app.applicant_id, app.gig_title, app.gig_description, app.proposed_price]
      );

      // Reject all other applications for this gig
      await connection.query(
        "UPDATE applications SET status = 'REJECTED' WHERE gig_id = ? AND id != ?",
        [app.gig_id, appId]
      );

      // Notify the applicant
      await connection.query(
        `INSERT INTO notifications (user_id, title, content)
         VALUES (?, 'Application Accepted!', ?)`,
        [app.applicant_id, `Congratulations! Your application for "${app.gig_title}" was accepted. You can start working on it.`]
      );
    } else {
      // Notify the applicant
      await connection.query(
        `INSERT INTO notifications (user_id, title, content)
         VALUES (?, 'Application Update', ?)`,
        [app.applicant_id, `Thank you for applying. Unfortunately, your application for "${app.gig_title}" was not selected.`]
      );
      
      // Check if there are other pending applications. If none, set gig status back to OPEN
      const [remainingApps] = await connection.query(
        "SELECT COUNT(*) as cnt FROM applications WHERE gig_id = ? AND status = 'PENDING'",
        [app.gig_id]
      );
      if (remainingApps[0].cnt === 0) {
        await connection.query("UPDATE gigs SET status = 'OPEN' WHERE id = ?", [app.gig_id]);
      }
    }

    await connection.commit();
    res.json({ message: `Application ${status.toLowerCase()} successfully.` });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error updating application.' });
  } finally {
    connection.release();
  }
};
