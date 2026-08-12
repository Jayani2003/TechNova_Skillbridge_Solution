const db = require('../config/db');

exports.getConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const [conversations] = await db.query(
      `SELECT DISTINCT 
         CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as contact_id,
         u.full_name as contact_name, 
         u.profile_image as contact_image, 
         u.user_type as contact_type,
         (SELECT content FROM messages 
          WHERE (sender_id = m.sender_id AND receiver_id = m.receiver_id) OR (sender_id = m.receiver_id AND receiver_id = m.sender_id)
          ORDER BY created_at DESC LIMIT 1) as last_message,
         (SELECT created_at FROM messages 
          WHERE (sender_id = m.sender_id AND receiver_id = m.receiver_id) OR (sender_id = m.receiver_id AND receiver_id = m.sender_id)
          ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM messages m
       JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY last_message_time DESC`,
      [userId, userId, userId, userId]
    );

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving conversations.' });
  }
};

exports.getMessages = async (req, res) => {
  const userId = req.user.id;
  const { contactId } = req.query;

  if (!contactId) {
    return res.status(400).json({ message: 'Missing contact ID parameter.' });
  }

  try {
    // Mark incoming messages from this contact as read
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [contactId, userId]
    );

    const [messages] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY created_at ASC`,
      [userId, contactId, contactId, userId]
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving message history.' });
  }
};

exports.sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, content } = req.body;

  if (!receiver_id || !content) {
    return res.status(400).json({ message: 'Receiver and message content are required.' });
  }

  try {
    const [sendRes] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiver_id, content]
    );

    // Retrieve sender's name for notification
    const [senderCheck] = await db.query('SELECT full_name FROM users WHERE id = ?', [senderId]);
    const senderName = senderCheck[0].full_name;

    // Trigger notification
    await db.query(
      `INSERT INTO notifications (user_id, title, content)
       VALUES (?, ?, ?)`,
      [receiver_id, `New message from ${senderName}`, content.length > 60 ? content.substring(0, 57) + '...' : content]
    );

    res.status(201).json({
      id: sendRes.insertId,
      sender_id: senderId,
      receiver_id,
      content,
      created_at: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message.' });
  }
};
