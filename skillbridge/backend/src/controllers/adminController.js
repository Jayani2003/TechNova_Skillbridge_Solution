const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    const [gigs] = await db.query('SELECT COUNT(*) as count FROM gigs');
    const [jobs] = await db.query('SELECT COUNT(*) as count FROM jobs');
    const [boarding] = await db.query('SELECT COUNT(*) as count FROM boarding');
    
    // Total income logic from jobs where status is COMPLETED
    const [incomeResult] = await db.query("SELECT SUM(budget) as total FROM jobs WHERE status = 'COMPLETED'");

    res.json({
      totalUsers: users[0].count,
      totalGigs: gigs[0].count,
      totalJobs: jobs[0].count,
      totalBoarding: boarding[0].count,
      totalIncome: incomeResult[0].total || 0
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, full_name, email, user_type, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Don't let admin delete themselves
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete yourself.' });
    }
    
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.getGigs = async (req, res) => {
  try {
    const [gigs] = await db.query('SELECT id, title, category, budget, status, created_at FROM gigs ORDER BY created_at DESC');
    res.json(gigs);
  } catch (error) {
    console.error('Error in getGigs:', error);
    res.status(500).json({ message: 'Error fetching gigs' });
  }
};

exports.deleteGig = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM gigs WHERE id = ?', [id]);
    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    console.error('Error in deleteGig:', error);
    res.status(500).json({ message: 'Error deleting gig' });
  }
};

// ==========================================
// NEW ADVANCED FEATURES
// ==========================================

exports.getUnverifiedStudents = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.created_at, sp.university, sp.student_registration_no 
       FROM users u 
       JOIN student_profiles sp ON u.id = sp.user_id 
       WHERE u.user_type = 'STUDENT' AND u.is_verified = FALSE 
       ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (error) {
    console.error('Error in getUnverifiedStudents:', error);
    res.status(500).json({ message: 'Error fetching unverified students' });
  }
};

exports.verifyStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE users SET is_verified = TRUE WHERE id = ? AND user_type = "STUDENT"', [id]);
    res.json({ message: 'Student verified successfully' });
  } catch (error) {
    console.error('Error in verifyStudent:', error);
    res.status(500).json({ message: 'Error verifying student' });
  }
};

exports.getDisputedJobs = async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT j.id, j.title, j.budget, j.status, 
              p.full_name as poster_name, w.full_name as worker_name 
       FROM jobs j
       JOIN users p ON j.poster_id = p.id
       JOIN users w ON j.worker_id = w.id
       WHERE j.has_dispute = TRUE
       ORDER BY j.updated_at DESC`
    );
    res.json(jobs);
  } catch (error) {
    console.error('Error in getDisputedJobs:', error);
    res.status(500).json({ message: 'Error fetching disputed jobs' });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body; // 'COMPLETED' or 'CANCELLED'
    
    if (resolution !== 'COMPLETED' && resolution !== 'CANCELLED') {
      return res.status(400).json({ message: 'Invalid resolution status' });
    }

    await db.query(
      'UPDATE jobs SET status = ?, has_dispute = FALSE WHERE id = ?', 
      [resolution, id]
    );
    res.json({ message: 'Dispute resolved successfully' });
  } catch (error) {
    console.error('Error in resolveDispute:', error);
    res.status(500).json({ message: 'Error resolving dispute' });
  }
};

exports.getResources = async (req, res) => {
  try {
    const [resources] = await db.query('SELECT id, title, type, category, status, created_at FROM resources ORDER BY created_at DESC');
    res.json(resources);
  } catch (error) {
    console.error('Error in getResources:', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM resources WHERE id = ?', [id]);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error in deleteResource:', error);
    res.status(500).json({ message: 'Error deleting resource' });
  }
};
