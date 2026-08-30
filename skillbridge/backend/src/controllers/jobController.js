const db = require('../config/db');

exports.getAllJobs = async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch jobs where user is poster (employer) or worker
    const [jobs] = await db.query(
      `SELECT j.*, 
              up.full_name as poster_name, up.profile_image as poster_image,
              uw.full_name as worker_name, uw.profile_image as worker_image,
              r.rating_value as worker_rating
       FROM jobs j
       JOIN users up ON j.poster_id = up.id
       JOIN users uw ON j.worker_id = uw.id
       LEFT JOIN ratings r ON r.job_id = j.id AND r.reviewee_id = j.worker_id
       WHERE j.poster_id = ? OR j.worker_id = ?
       ORDER BY j.created_at DESC`,
      [userId, userId]
    );

    // Compute financial summary
    let totalEarned = 0;
    let totalSpent = 0;
    let activeCount = 0;
    let completedCount = 0;

    jobs.forEach(job => {
      const budget = parseFloat(job.budget || 0);
      if (job.status === 'COMPLETED') {
        completedCount++;
        if (job.worker_id === userId) {
          totalEarned += budget;
        }
        if (job.poster_id === userId) {
          totalSpent += budget;
        }
      } else if (job.status === 'IN_PROGRESS') {
        activeCount++;
      }
    });

    res.json({
      jobs,
      summary: {
        total_earned: totalEarned,
        total_spent: totalSpent,
        active_jobs: activeCount,
        completed_jobs: completedCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving jobs list.' });
  }
};

exports.getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const [jobRows] = await db.query(
      `SELECT j.*, 
              up.full_name as poster_name, up.phone as poster_phone, up.email as poster_email,
              uw.full_name as worker_name, uw.phone as worker_phone, uw.email as worker_email
       FROM jobs j
       JOIN users up ON j.poster_id = up.id
       JOIN users uw ON j.worker_id = uw.id
       WHERE j.id = ?`,
      [id]
    );

    if (jobRows.length === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const job = jobRows[0];

    // Fetch ratings for this job
    const [ratings] = await db.query(
      `SELECT r.*, u.full_name as reviewer_name 
       FROM ratings r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.job_id = ?`,
      [id]
    );
    job.ratings = ratings;

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving job details.' });
  }
};

exports.updateJobStatus = async (req, res) => {
  const jobId = req.params.id;
  const { status } = req.body; // 'COMPLETED' or 'CANCELLED'
  const userId = req.user.id;

  if (status !== 'WORK_DONE' && status !== 'COMPLETED' && status !== 'CANCELLED') {
    return res.status(400).json({ message: 'Invalid job status change.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify job exists and user is the poster (employer)
    const [jobRows] = await connection.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (jobRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Job not found.' });
    }

    const job = jobRows[0];
    if (job.poster_id !== userId && job.worker_id !== userId) {
      connection.release();
      return res.status(403).json({ message: 'Only the job poster or worker can update the job status.' });
    }

    if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      connection.release();
      return res.status(400).json({ message: 'This job is already completed or cancelled.' });
    }

    if (status === 'WORK_DONE' && job.worker_id !== userId) {
      connection.release();
      return res.status(403).json({ message: 'Only the worker can mark the job as done.' });
    }

    if (status === 'COMPLETED' && job.poster_id !== userId) {
      connection.release();
      return res.status(403).json({ message: 'Only the employer can release payment and mark as completed.' });
    }

    await connection.query('UPDATE jobs SET status = ? WHERE id = ?', [status, jobId]);

    if (job.gig_id) {
      await connection.query('UPDATE gigs SET status = ? WHERE id = ?', [status, job.gig_id]);
    }

    // Notify the other party
    const isEmployer = userId === job.poster_id;
    const notifyUserId = isEmployer ? job.worker_id : job.poster_id;
    const actor = isEmployer ? 'employer' : 'worker';

    let notificationText = '';
    if (status === 'WORK_DONE') {
      notificationText = `The job "${job.title}" has been marked as Done by the worker. Please verify and release payment.`;
    } else if (status === 'COMPLETED') {
      notificationText = `The payment for "${job.title}" has been released by the employer. The job is now fully completed.`;
    } else {
      notificationText = `The job "${job.title}" has been cancelled by the ${actor}.`;
    }
      
    await connection.query(
      `INSERT INTO notifications (user_id, title, content) VALUES (?, ?, ?)`,
      [notifyUserId, `Job marked as ${status.toLowerCase()}`, notificationText]
    );

    await connection.commit();
    res.json({ message: `Job marked as ${status.toLowerCase()} successfully.` });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error updating job status.' });
  } finally {
    connection.release();
  }
};

exports.createRating = async (req, res) => {
  const jobId = req.params.id;
  const reviewerId = req.user.id;
  const { rating_value, feedback } = req.body;

  if (!rating_value || rating_value < 1 || rating_value > 5) {
    return res.status(400).json({ message: 'Please provide a valid rating score between 1 and 5.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify job is completed and user was the poster or worker
    const [jobRows] = await connection.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (jobRows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Job not found.' });
    }

    const job = jobRows[0];
    if (job.status !== 'COMPLETED') {
      connection.release();
      return res.status(400).json({ message: 'You can only rate a job that has been completed.' });
    }

    // Determine reviewee
    let revieweeId;
    if (reviewerId === job.poster_id) {
      revieweeId = job.worker_id;
    } else if (reviewerId === job.worker_id) {
      revieweeId = job.poster_id;
    } else {
      connection.release();
      return res.status(403).json({ message: 'You are not authorized to rate this job.' });
    }

    // Check if rating already exists from reviewer to reviewee for this job
    const [existing] = await connection.query(
      'SELECT id FROM ratings WHERE job_id = ? AND reviewer_id = ? AND reviewee_id = ?',
      [jobId, reviewerId, revieweeId]
    );
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'You have already rated this job.' });
    }

    await connection.query(
      `INSERT INTO ratings (job_id, reviewer_id, reviewee_id, rating_value, feedback)
       VALUES (?, ?, ?, ?, ?)`,
      [jobId, reviewerId, revieweeId, rating_value, feedback || '']
    );

    // Notify reviewee
    await connection.query(
      `INSERT INTO notifications (user_id, title, content)
       VALUES (?, 'New Rating Received', ?)`,
      [revieweeId, `You received a ${rating_value} star rating for the job "${job.title}".`]
    );

    await connection.commit();
    res.status(201).json({ message: 'Rating submitted successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error submitting rating.' });
  } finally {
    connection.release();
  }
};

exports.hireDirectly = async (req, res) => {
  const { worker_id, title, description, budget, deadline } = req.body;
  const posterId = req.user.id;

  if (!worker_id || !title || !description || !budget || !deadline) {
    return res.status(400).json({ message: 'Please provide all details for the hiring request.' });
  }

  try {
    // Check if worker exists
    const [workerRows] = await db.query('SELECT full_name FROM users WHERE id = ?', [worker_id]);
    if (workerRows.length === 0) {
      return res.status(404).json({ message: 'Worker not found.' });
    }

    const [posterRows] = await db.query('SELECT full_name FROM users WHERE id = ?', [posterId]);
    const posterName = posterRows[0].full_name;

    // Send a notification to the worker containing the contract details inside the message
    // We will serialize the direct hire request into the notification so the worker can Accept/Reject it
    const requestDetails = JSON.stringify({
      posterId,
      posterName,
      title,
      description,
      budget,
      deadline
    });

    await db.query(
      `INSERT INTO notifications (user_id, title, content)
       VALUES (?, 'Direct Hire Offer Received', ?)`,
      [worker_id, `OFFER_PROPOSAL:${requestDetails}`]
    );

    res.status(201).json({ message: 'Hiring proposal sent successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending direct hire request.' });
  }
};

exports.acceptDirectHire = async (req, res) => {
  const workerId = req.user.id;
  const { proposalDetails, accept } = req.body; // accept is boolean

  if (!proposalDetails) {
    return res.status(400).json({ message: 'Missing offer proposal details.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const proposal = typeof proposalDetails === 'string' ? JSON.parse(proposalDetails) : proposalDetails;

    if (accept) {
      // Create job
      await connection.query(
        `INSERT INTO jobs (gig_id, poster_id, worker_id, title, description, budget, status)
         VALUES (NULL, ?, ?, ?, ?, ?, 'IN_PROGRESS')`,
        [proposal.posterId, workerId, proposal.title, proposal.description, proposal.budget]
      );

      // Notify poster
      await connection.query(
        `INSERT INTO notifications (user_id, title, content)
         VALUES (?, 'Direct Hire Offer Accepted!', ?)`,
        [proposal.posterId, `Your offer to hire ${req.user.full_name || 'the student'} for "${proposal.title}" has been accepted. Work has started.`]
      );
    } else {
      // Notify poster of rejection
      await connection.query(
        `INSERT INTO notifications (user_id, title, content)
         VALUES (?, 'Direct Hire Offer Declined', ?)`,
        [proposal.posterId, `Unfortunately, ${req.user.full_name || 'the student'} declined your direct hire offer for "${proposal.title}".`]
      );
    }

    await connection.commit();
    res.json({ message: accept ? 'Hiring offer accepted!' : 'Hiring offer declined.' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error processing hiring proposal.' });
  } finally {
    connection.release();
  }
};
