const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT
  });

  try {
    const [rows] = await c.query("SELECT * FROM users WHERE id = 1");
    if(rows.length > 0) {
      console.log(rows[0].email, "is currently", rows[0].user_type);
      const [student] = await c.query("SELECT * FROM student_profiles WHERE user_id = 1");
      if(student.length > 0) {
        await c.query("UPDATE users SET user_type='STUDENT' WHERE id=1");
        console.log("Reverted ID 1 to STUDENT");
      } else {
        await c.query("UPDATE users SET user_type='COMMUNITY_MEMBER' WHERE id=1");
        console.log("Reverted ID 1 to COMMUNITY_MEMBER");
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
