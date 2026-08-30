const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    // 1. Add ADMIN to user_type enum
    await connection.query("ALTER TABLE users MODIFY user_type ENUM('STUDENT', 'COMMUNITY_MEMBER', 'ADMIN') NOT NULL");
    console.log("Database updated: user_type now includes 'ADMIN'");

    // 2. Make user ID 1 an admin (assuming user ID 1 exists, usually the first user created)
    const [result] = await connection.query("UPDATE users SET user_type = 'ADMIN' WHERE id = 1");
    if (result.affectedRows > 0) {
      console.log("Successfully made User ID 1 an ADMIN.");
    } else {
      console.log("User ID 1 not found. You can manually run: UPDATE users SET user_type = 'ADMIN' WHERE email = 'your_email';");
    }

  } catch (error) {
    console.error("Error updating database", error);
  } finally {
    await connection.end();
  }
}

run();
