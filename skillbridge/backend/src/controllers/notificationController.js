const db = require('../config/db');

exports.getAllNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating notification status.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating notifications.' });
  }
};
