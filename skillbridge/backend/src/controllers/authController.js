const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_jwt_secret_hackathon_2026';

// Helper to fetch complete user profile
async function fetchUserProfile(connection, userId, userType) {
  const [userRows] = await connection.query(
    'SELECT id, full_name, email, phone, user_type, profile_image, location, latitude, longitude, created_at FROM users WHERE id = ?',
    [userId]
  );
  if (userRows.length === 0) return null;
  const user = userRows[0];

  if (userType === 'STUDENT') {
    const [studentRows] = await connection.query(
      'SELECT university, faculty, academic_year, degree_program, availability, expected_rate, bio FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    const [skillsRows] = await connection.query(
      'SELECT skill_name FROM user_skills WHERE user_id = ?',
      [userId]
    );
    user.profile = studentRows[0] || {};
    user.skills = skillsRows.map(row => row.skill_name);
  } else if (userType === 'COMMUNITY_MEMBER') {
    const [communityRows] = await connection.query(
      'SELECT occupation, business_name, services, bio FROM community_profiles WHERE user_id = ?',
      [userId]
    );
    user.profile = communityRows[0] || {};
    user.skills = []; // community members can have services instead of standard skills
  }

  // Calculate stats for Opportunity Score & Impact
  const [jobStats] = await connection.query(
    `SELECT 
       COUNT(*) as completed_jobs, 
       IFNULL(SUM(budget), 0) as total_earnings 
     FROM jobs 
     WHERE worker_id = ? AND status = 'COMPLETED'`,
    [userId]
  );
  
  const [ratingStats] = await connection.query(
    `SELECT AVG(rating_value) as avg_rating, COUNT(*) as ratings_count FROM ratings WHERE reviewee_id = ?`,
    [userId]
  );
  
  user.completed_jobs = jobStats[0].completed_jobs || 0;
  user.total_earnings = parseFloat(jobStats[0].total_earnings || 0);
  user.avg_rating = parseFloat(ratingStats[0].avg_rating || 0).toFixed(1);
  user.ratings_count = ratingStats[0].ratings_count || 0;

  return user;
}

exports.register = async (req, res) => {
  const {
    full_name,
    email,
    password,
    phone,
    user_type,
    location,
    latitude,
    longitude,
    // Student fields
    university,
    faculty,
    academic_year,
    degree_program,
    // Community fields
    occupation,
    business_name,
    services
  } = req.body;

  if (!full_name || !email || !password || !phone || !user_type || !location) {
    return res.status(400).json({ message: 'Please fill in all common required fields.' });
  }

  if (user_type !== 'STUDENT' && user_type !== 'COMMUNITY_MEMBER') {
    return res.status(400).json({ message: 'Invalid user type selection.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if email already registered
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const lat = latitude || 6.0535;
    const lng = longitude || 80.5332;

    // Insert user
    const [userRes] = await connection.query(
      `INSERT INTO users (full_name, email, password_hash, phone, user_type, location, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, passwordHash, phone, user_type, location, lat, lng]
    );
    const userId = userRes.insertId;

    // Insert type-specific profile
    if (user_type === 'STUDENT') {
      if (!university || !faculty || !academic_year || !degree_program) {
        throw new Error('Please fill in all student profile details.');
      }
      await connection.query(
        `INSERT INTO student_profiles (user_id, university, faculty, academic_year, degree_program)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, university, faculty, academic_year, degree_program]
      );
    } else {
      if (!occupation) {
        throw new Error('Please enter your occupation.');
      }
      await connection.query(
        `INSERT INTO community_profiles (user_id, occupation, business_name, services)
         VALUES (?, ?, ?, ?)`,
        [userId, occupation, business_name || '', services || '']
      );
    }

    // Insert initial notification
    await connection.query(
      `INSERT INTO notifications (user_id, title, content)
       VALUES (?, 'Welcome to SkillBridge!', 'Your account has been registered successfully. Set up your profile to start earning and helping!')`,
      [userId]
    );

    await connection.commit();

    // Fetch the registered user
    const user = await fetchUserProfile(connection, userId, user_type);
    
    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email, user_type: user.user_type }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message || 'Error occurred during registration.' });
  } finally {
    connection.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter both email and password.' });
  }

  try {
    const [userRows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userRows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userRecord = userRows[0];
    const isMatch = await bcrypt.compare(password, userRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Fetch user and profile
    const user = await fetchUserProfile(db, userRecord.id, userRecord.user_type);
    
    const token = jwt.sign({ id: user.id, email: user.email, user_type: user.user_type }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await fetchUserProfile(db, req.user.id, req.user.user_type);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user info.' });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const {
    full_name,
    phone,
    location,
    latitude,
    longitude,
    profile_image,
    user_type,
    // Student fields
    university,
    faculty,
    academic_year,
    degree_program,
    availability,
    expected_rate,
    bio,
    skills,
    // Community fields
    occupation,
    business_name,
    services
  } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.query('SELECT full_name, phone, user_type, profile_image FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentUserType = user_type || req.user.user_type || existingUsers[0].user_type;
    const currentProfileImage = profile_image !== undefined ? profile_image : existingUsers[0].profile_image;

    // Update users basic details
    await connection.query(
      `UPDATE users 
       SET full_name = ?, phone = ?, location = ?, latitude = ?, longitude = ?, profile_image = ?
       WHERE id = ?`,
      [
        full_name || existingUsers[0].full_name,
        phone || existingUsers[0].phone || '',
        location || '',
        latitude || 6.0535,
        longitude || 80.5332,
        currentProfileImage,
        userId
      ]
    );

    if (currentUserType === 'STUDENT') {
      const [existingStudent] = await connection.query('SELECT user_id FROM student_profiles WHERE user_id = ?', [userId]);
      if (existingStudent.length > 0) {
        await connection.query(
          `UPDATE student_profiles 
           SET university = ?, faculty = ?, academic_year = ?, degree_program = ?, availability = ?, expected_rate = ?, bio = ?
           WHERE user_id = ?`,
          [
            university || '',
            faculty || '',
            academic_year || '1st Year',
            degree_program || '',
            availability || 'Weekends',
            expected_rate || 0.00,
            bio || '',
            userId
          ]
        );
      } else {
        await connection.query(
          `INSERT INTO student_profiles (user_id, university, faculty, academic_year, degree_program, availability, expected_rate, bio)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            university || '',
            faculty || '',
            academic_year || '1st Year',
            degree_program || '',
            availability || 'Weekends',
            expected_rate || 0.00,
            bio || ''
          ]
        );
      }

      // Handle skills updates (delete existing and insert new ones)
      if (Array.isArray(skills)) {
        await connection.query('DELETE FROM user_skills WHERE user_id = ?', [userId]);
        for (let s of skills) {
          if (s.trim()) {
            await connection.query('INSERT INTO user_skills (user_id, skill_name) VALUES (?, ?)', [userId, s.trim()]);
          }
        }
      }
    } else {
      const [existingCommunity] = await connection.query('SELECT user_id FROM community_profiles WHERE user_id = ?', [userId]);
      if (existingCommunity.length > 0) {
        await connection.query(
          `UPDATE community_profiles 
           SET occupation = ?, business_name = ?, services = ?, bio = ?
           WHERE user_id = ?`,
          [occupation || '', business_name || '', services || '', bio || '', userId]
        );
      } else {
        await connection.query(
          `INSERT INTO community_profiles (user_id, occupation, business_name, services, bio)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, occupation || '', business_name || '', services || '', bio || '']
        );
      }
    }

    await connection.commit();
    const updatedUser = await fetchUserProfile(db, userId, currentUserType);
    res.json(updatedUser);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message || 'Error updating profile.' });
  } finally {
    connection.release();
  }
};
