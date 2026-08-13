const db = require('../config/db');

exports.getGlobalImpact = async (req, res) => {
  try {
    // 1. Users count
    const [students] = await db.query("SELECT COUNT(*) as count FROM users WHERE user_type = 'STUDENT'");
    const [community] = await db.query("SELECT COUNT(*) as count FROM users WHERE user_type = 'COMMUNITY_MEMBER'");

    // 2. Gigs & Jobs
    const [gigs] = await db.query("SELECT COUNT(*) as count FROM gigs");
    const [completedJobs] = await db.query("SELECT COUNT(*) as count, IFNULL(SUM(budget), 0) as total_income FROM jobs WHERE status = 'COMPLETED'");

    // 3. Resources Donated/Reused
    const [donatedItems] = await db.query("SELECT COUNT(*) as count FROM resources WHERE type = 'DONATION' AND status = 'DONATED'");
    const [reusedItems] = await db.query("SELECT category, COUNT(*) as count FROM resources WHERE status = 'DONATED' GROUP BY category");

    // Calculate community savings
    let estimatedSavings = 0;
    let totalReused = 0;
    reusedItems.forEach(group => {
      totalReused += group.count;
      if (group.category.toLowerCase().includes('textbook')) {
        estimatedSavings += group.count * 3000; // Rs. 3000 saved per textbook
      } else if (group.category.toLowerCase().includes('calculator')) {
        estimatedSavings += group.count * 4500; // Rs. 4500 saved per scientific calculator
      } else {
        estimatedSavings += group.count * 1500; // default savings of Rs. 1500
      }
    });

    // Income generated also contributes to community economic support
    const studentCount = students[0].count;
    const communityCount = community[0].count;
    const opportunitiesCount = gigs[0].count;
    const jobsCompletedCount = completedJobs[0].count;
    const incomeGenerated = parseFloat(completedJobs[0].total_income);
    
    // People helped count
    const [helpedStats] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT worker_id as user_id FROM jobs WHERE status = 'COMPLETED'
        UNION
        SELECT poster_id as user_id FROM jobs WHERE status = 'COMPLETED'
        UNION
        SELECT owner_id as user_id FROM resources WHERE status = 'DONATED'
      ) as temp
    `);

    res.json({
      studentsConnected: studentCount,
      communityConnected: communityCount,
      opportunitiesPosted: opportunitiesCount,
      jobsCompleted: jobsCompletedCount,
      totalIncomeGenerated: incomeGenerated,
      resourcesDonated: donatedItems[0].count,
      resourcesReused: totalReused,
      peopleHelped: helpedStats[0].count,
      estimatedCommunitySavings: estimatedSavings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving global impact metrics.' });
  }
};

exports.getUserImpact = async (req, res) => {
  const { id } = req.params;
  try {
    const [userRows] = await db.query('SELECT user_type FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Completed jobs as worker or poster
    const [workerJobs] = await db.query("SELECT COUNT(*) as count, IFNULL(SUM(budget), 0) as earned FROM jobs WHERE worker_id = ? AND status = 'COMPLETED'", [id]);
    const [posterJobs] = await db.query("SELECT COUNT(*) as count, IFNULL(SUM(budget), 0) as spent FROM jobs WHERE poster_id = ? AND status = 'COMPLETED'", [id]);

    // Resources donated by user
    const [resources] = await db.query("SELECT COUNT(*) as count FROM resources WHERE owner_id = ? AND status = 'DONATED'", [id]);

    // Average rating received
    const [ratings] = await db.query("SELECT AVG(rating_value) as avg_rating FROM ratings WHERE reviewee_id = ?", [id]);

    const completed = workerJobs[0].count + posterJobs[0].count;
    const earned = parseFloat(workerJobs[0].earned);
    const spent = parseFloat(posterJobs[0].spent);
    const donated = resources[0].count;
    const rating = parseFloat(ratings[0].avg_rating || 0).toFixed(1);

    // Rough hours contributed: 8 hours per completed job + 2 hours per resource donated
    const hours = (workerJobs[0].count * 8) + (donated * 2);

    res.json({
      jobsCompleted: completed,
      earned,
      spent,
      resourcesDonated: donated,
      hoursContributed: hours,
      averageRating: rating,
      peopleHelped: workerJobs[0].count + resources[0].count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user impact metrics.' });
  }
};
