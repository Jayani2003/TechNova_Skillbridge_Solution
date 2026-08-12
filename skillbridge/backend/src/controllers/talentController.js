const db = require('../config/db');
const { calculateOpportunityScore } = require('../utils/matching');

exports.getAllTalents = async (req, res) => {
  const { skill, search, availability, minRating, minOppScore, userType } = req.query;

  // By default, list student talent, but allow search for both if userType is specified
  const targetType = userType || 'STUDENT';

  let query = `
    SELECT u.id, u.full_name, u.email, u.phone, u.profile_image, u.user_type, u.location, u.latitude, u.longitude,
           sp.university, sp.faculty, sp.academic_year, sp.degree_program, sp.availability, sp.expected_rate, sp.bio as student_bio,
           cp.occupation, cp.business_name, cp.services, cp.bio as community_bio
    FROM users u
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    LEFT JOIN community_profiles cp ON u.id = cp.user_id
    WHERE u.user_type = ?
  `;
  const params = [targetType];

  if (search) {
    query += ' AND (u.full_name LIKE ? OR sp.bio LIKE ? OR cp.bio LIKE ? OR cp.services LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (availability) {
    query += ' AND (sp.availability LIKE ?)';
    params.push(`%${availability}%`);
  }

  try {
    const [rows] = await db.query(query, params);
    const talentList = [];

    for (let user of rows) {
      // Fetch skills
      const [skillsRows] = await db.query('SELECT skill_name FROM user_skills WHERE user_id = ?', [user.id]);
      const skills = skillsRows.map(row => row.skill_name);

      // Filter by skill if requested
      if (skill && !skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        continue;
      }

      // Fetch jobs and ratings stats
      const [jobStats] = await db.query("SELECT COUNT(*) as completed_jobs FROM jobs WHERE worker_id = ? AND status = 'COMPLETED'", [user.id]);
      const [ratingStats] = await db.query("SELECT AVG(rating_value) as avg_rating, COUNT(*) as ratings_count FROM ratings WHERE reviewee_id = ?", [user.id]);

      user.skills = skills;
      user.completed_jobs = jobStats[0].completed_jobs || 0;
      user.avg_rating = ratingStats[0].avg_rating || 0;
      user.ratings_count = ratingStats[0].ratings_count || 0;

      // Calculate dynamic Opportunity Score
      const oppScoreDetails = calculateOpportunityScore(user);
      user.opportunity_score = oppScoreDetails.score;
      user.opportunity_score_breakdown = oppScoreDetails.breakdown;

      // Apply score filters
      if (minRating && user.avg_rating < parseFloat(minRating)) continue;
      if (minOppScore && user.opportunity_score < parseInt(minOppScore)) continue;

      talentList.push({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        profile_image: user.profile_image,
        user_type: user.user_type,
        location: user.location,
        latitude: user.latitude,
        longitude: user.longitude,
        skills: user.skills,
        completed_jobs: user.completed_jobs,
        avg_rating: parseFloat(user.avg_rating || 0).toFixed(1),
        ratings_count: user.ratings_count,
        opportunity_score: user.opportunity_score,
        opportunity_score_breakdown: user.opportunity_score_breakdown,
        // Profile properties
        university: user.university,
        faculty: user.faculty,
        academic_year: user.academic_year,
        degree_program: user.degree_program,
        availability: user.availability,
        expected_rate: parseFloat(user.expected_rate || 0),
        bio: user.user_type === 'STUDENT' ? user.student_bio : user.community_bio,
        occupation: user.occupation,
        business_name: user.business_name,
        services: user.services
      });
    }

    // Sort by Opportunity Score descending
    talentList.sort((a, b) => b.opportunity_score - a.opportunity_score);

    res.json(talentList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving talent list.' });
  }
};

exports.getTalentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [userRows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.profile_image, u.user_type, u.location, u.latitude, u.longitude,
              sp.university, sp.faculty, sp.academic_year, sp.degree_program, sp.availability, sp.expected_rate, sp.bio as student_bio,
              cp.occupation, cp.business_name, cp.services, cp.bio as community_bio
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN community_profiles cp ON u.id = cp.user_id
       WHERE u.id = ?`,
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const user = userRows[0];
    
    // Fetch skills
    const [skillsRows] = await db.query('SELECT skill_name FROM user_skills WHERE user_id = ?', [id]);
    user.skills = skillsRows.map(row => row.skill_name);

    // Fetch stats
    const [jobStats] = await db.query("SELECT COUNT(*) as completed_jobs FROM jobs WHERE worker_id = ? AND status = 'COMPLETED'", [id]);
    const [ratingStats] = await db.query("SELECT AVG(rating_value) as avg_rating, COUNT(*) as ratings_count FROM ratings WHERE reviewee_id = ?", [id]);

    user.completed_jobs = jobStats[0].completed_jobs || 0;
    user.avg_rating = ratingStats[0].avg_rating || 0;
    user.ratings_count = ratingStats[0].ratings_count || 0;

    const oppScoreDetails = calculateOpportunityScore(user);
    user.opportunity_score = oppScoreDetails.score;
    user.opportunity_score_breakdown = oppScoreDetails.breakdown;

    // Fetch ratings history for this user
    const [ratingsHistory] = await db.query(
      `SELECT r.*, u.full_name as reviewer_name, u.profile_image as reviewer_image, j.title as job_title
       FROM ratings r
       JOIN users u ON r.reviewer_id = u.id
       JOIN jobs j ON r.job_id = j.id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      profile_image: user.profile_image,
      user_type: user.user_type,
      location: user.location,
      latitude: user.latitude,
      longitude: user.longitude,
      skills: user.skills,
      completed_jobs: user.completed_jobs,
      avg_rating: parseFloat(user.avg_rating || 0).toFixed(1),
      ratings_count: user.ratings_count,
      opportunity_score: user.opportunity_score,
      opportunity_score_breakdown: user.opportunity_score_breakdown,
      university: user.university,
      faculty: user.faculty,
      academic_year: user.academic_year,
      degree_program: user.degree_program,
      availability: user.availability,
      expected_rate: parseFloat(user.expected_rate || 0),
      bio: user.user_type === 'STUDENT' ? user.student_bio : user.community_bio,
      occupation: user.occupation,
      business_name: user.business_name,
      services: user.services,
      ratings: ratingsHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving profile details.' });
  }
};
