const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const [res] = await connection.query(
      `INSERT INTO users (full_name, email, password_hash, phone, user_type, location) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['System Admin', 'admin@skillbridge.com', passwordHash, '0700000000', 'ADMIN', 'Matara']
    );
    
    console.log("New Admin created successfully!");
    console.log("Email: admin@skillbridge.com");
    console.log("Password: password123");

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log("An admin with admin@skillbridge.com already exists! Updating password to password123...");
      const passwordHash = await bcrypt.hash('password123', 10);
      await connection.query("UPDATE users SET password_hash = ? WHERE email = 'admin@skillbridge.com'", [passwordHash]);
      console.log("Password updated successfully.");
    } else {
      console.error("Error updating database", error);
    }
  } finally {
    await connection.end();
  }
}

run();
