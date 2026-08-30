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
    // Add is_verified to users
    try {
      await c.query("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE");
      console.log("Added is_verified to users");
    } catch (e) {
      if(e.code === 'ER_DUP_FIELDNAME') console.log("is_verified already exists");
      else throw e;
    }

    // Add has_dispute to jobs
    try {
      await c.query("ALTER TABLE jobs ADD COLUMN has_dispute BOOLEAN DEFAULT FALSE");
      console.log("Added has_dispute to jobs");
    } catch (e) {
      if(e.code === 'ER_DUP_FIELDNAME') console.log("has_dispute already exists");
      else throw e;
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}
run();
