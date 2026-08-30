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
    await connection.query("ALTER TABLE jobs MODIFY status ENUM('IN_PROGRESS', 'WORK_DONE', 'COMPLETED', 'CANCELLED') DEFAULT 'IN_PROGRESS'");
    await connection.query("ALTER TABLE gigs MODIFY status ENUM('OPEN', 'APPLIED', 'ACCEPTED', 'IN_PROGRESS', 'WORK_DONE', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN'");
    console.log("Database updated successfully");
  } catch (error) {
    console.error("Error updating database", error);
  } finally {
    await connection.end();
  }
}

run();
