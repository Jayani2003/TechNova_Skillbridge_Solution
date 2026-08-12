const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function init() {
  console.log('Connecting to MySQL with credentials:', {
    host: dbConfig.host,
    user: dbConfig.user,
    port: dbConfig.port
  });
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection successful.');
    
    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`Reading SQL schema from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split queries by semicolon (taking care of double newlines/carriage returns)
    const queries = schemaSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);
      
    console.log(`Executing ${queries.length} queries to initialize database schema...`);
    for (let query of queries) {
      await connection.query(query);
    }
    console.log('Database schema created successfully.');
    
    // Select skillbridge db
    await connection.query('USE skillbridge;');
    
    // Generate passwords
    const passwordHash = await bcrypt.hash('password123', 10);
    console.log('Hashed default password "password123" for demo accounts.');
    
    // Insert Users
    console.log('Inserting seed users...');
    const users = [
      // Students
      ['Alex Fernando', 'student@skillbridge.demo', passwordHash, '0771234567', 'STUDENT', 'Karagoda Uyangoda, Matara', 6.0712, 80.5751],
      ['Nimal Silva', 'student2@skillbridge.demo', passwordHash, '0722223333', 'STUDENT', 'Ruhuna Campus, Galle', 6.0329, 80.2144],
      // Community Members
      ['Kasun Perera', 'community@skillbridge.demo', passwordHash, '0719876543', 'COMMUNITY_MEMBER', 'Karagoda Uyangoda, Matara', 6.0725, 80.5750],
      ['Priyantha Bandara', 'community2@skillbridge.demo', passwordHash, '0767778888', 'COMMUNITY_MEMBER', 'Matara Town', 6.0410, 80.5360]
    ];
    
    const userIds = {};
    for (let u of users) {
      const [res] = await connection.query(
        `INSERT INTO users (full_name, email, password_hash, phone, user_type, location, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        u
      );
      userIds[u[1]] = res.insertId;
    }
    
    // Insert Student Profiles
    console.log('Inserting student profiles...');
    await connection.query(
      `INSERT INTO student_profiles (user_id, university, faculty, academic_year, degree_program, availability, expected_rate, bio)
       VALUES 
       (?, 'University of Ruhuna', 'Faculty of Technology', '2nd Year', 'BICT (Hons)', 'Weekends & Evenings', 1500.00, 'Passionate tech student looking for graphic design and web development tasks.'),
       (?, 'University of Ruhuna', 'Faculty of Engineering', '3rd Year', 'B.Sc. Eng (Hons) in EIE', 'Evenings', 2000.00, 'Engineering student with solid experience in coding, Java development, and mathematical modeling.')`,
      [userIds['student@skillbridge.demo'], userIds['student2@skillbridge.demo']]
    );
    
    // Insert Community Profiles
    console.log('Inserting community profiles...');
    await connection.query(
      `INSERT INTO community_profiles (user_id, occupation, business_name, services, bio)
       VALUES 
       (?, 'Small Business Owner', 'ABC Printing', 'Printing, Photocopy, Graphic Design, Document Typing', 'Printing shop owner near the Faculty of Technology looking to hire students for freelance work and assist them with resource exchange.'),
       (?, 'Property Owner / Landlord', 'Bandara Lodging', 'Student Boarding, House Rental', 'Local resident providing safe, comfortable, and affordable boarding options for university students.')`,
      [userIds['community@skillbridge.demo'], userIds['community2@skillbridge.demo']]
    );
    
    // Insert Skills
    console.log('Inserting skills & user_skills...');
    const alexSkills = ['React', 'Node.js', 'JavaScript', 'HTML', 'CSS', 'Graphic Design', 'Photoshop'];
    for (let s of alexSkills) {
      await connection.query(
        `INSERT IGNORE INTO user_skills (user_id, skill_name) VALUES (?, ?)`,
        [userIds['student@skillbridge.demo'], s]
      );
    }
    
    const nimalSkills = ['Java', 'Python', 'SQL', 'Technical Writing', 'Mathematics'];
    for (let s of nimalSkills) {
      await connection.query(
        `INSERT IGNORE INTO user_skills (user_id, skill_name) VALUES (?, ?)`,
        [userIds['student2@skillbridge.demo'], s]
      );
    }
    
    // Insert Gigs
    console.log('Inserting gigs...');
    const gigQueries = [
      [
        userIds['community@skillbridge.demo'],
        'Need a promotional flyer designed for print shop',
        'Looking for a student who has experience with Photoshop/Illustrator to design a standard A4 double-sided flyer. Needs to be completed within 3 days. Ready to hire immediately.',
        'Graphic Design',
        5000.00,
        'Fixed',
        'Near Faculty of Technology, Karagoda Uyangoda',
        6.0725,
        80.5750,
        '2026-08-25',
        '3 days',
        'OPEN'
      ],
      [
        userIds['community@skillbridge.demo'],
        'Website landing page redesign',
        'Redesign our print shop landing page using modern UI guidelines. Must be responsive. Knowing React is a big plus. Budget is negotiable based on experience.',
        'IT & Technology',
        15000.00,
        'Fixed',
        'Near Faculty of Technology, Karagoda Uyangoda',
        6.0720,
        80.5755,
        '2026-09-01',
        '1 week',
        'OPEN'
      ],
      [
        userIds['community2@skillbridge.demo'],
        'Help setting up simple office bookkeeping system',
        'Need someone to design an Excel sheet or lightweight software to track rental payments and income. Ideal for a student who knows basic finance and Excel/SQL.',
        'Business Services',
        8000.00,
        'Fixed',
        'Matara Town',
        6.0410,
        80.5360,
        '2026-08-30',
        '4 days',
        'OPEN'
      ]
    ];
    
    const gigIds = [];
    for (let g of gigQueries) {
      const [res] = await connection.query(
        `INSERT INTO gigs (poster_id, title, description, category, budget, payment_type, location, latitude, longitude, deadline, duration, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        g
      );
      gigIds.push(res.insertId);
    }
    
    // Gig skills
    await connection.query(`INSERT INTO gig_skills (gig_id, skill_name) VALUES (?, 'Graphic Design'), (?, 'Photoshop')`, [gigIds[0], gigIds[0]]);
    await connection.query(`INSERT INTO gig_skills (gig_id, skill_name) VALUES (?, 'React'), (?, 'JavaScript'), (?, 'CSS')`, [gigIds[1], gigIds[1], gigIds[1]]);
    await connection.query(`INSERT INTO gig_skills (gig_id, skill_name) VALUES (?, 'SQL'), (?, 'Mathematics')`, [gigIds[2], gigIds[2]]);
    
    // Insert Boarding
    console.log('Inserting boarding listings...');
    await connection.query(
      `INSERT INTO boarding (poster_id, title, description, price, location, distance_from_faculty, available_date, rooms_count, facilities, contact_method, latitude, longitude)
       VALUES 
       (?, 'Spacious Student Room near Faculty of Technology', 'Single room in a student boarding house. Only 500 meters from the Faculty of Technology entrance. Shared kitchen, Wi-Fi, and laundry facilities. Calm environment suited for academic work.', 6500.00, 'Karagoda Uyangoda, Matara', 0.50, '2026-09-01', 1, 'Wi-Fi,Water,Electricity,Furnished,Parking,Kitchen', 'Call Priyantha on 0767778888', 6.0730, 80.5730),
       (?, 'Annex for 2 Students with Attached Bathroom', 'Annex with 1 bedroom, kitchen, and bathroom. Furnished with beds and study tables. High-speed fiber internet. Electricity and water bills are separate. 1.2 km from campus.', 12000.00, 'Kamburupitiya Road, Matara', 1.20, '2026-08-20', 2, 'Wi-Fi,Water,Electricity,Furnished,Attached bathroom,Parking', 'Message via app or call 0719876543', 6.0680, 80.5690)`,
      [userIds['community2@skillbridge.demo'], userIds['community@skillbridge.demo']]
    );
    
    // Insert Resources (Donations and Requests)
    console.log('Inserting resources...');
    await connection.query(
      `INSERT INTO resources (owner_id, title, description, category, item_condition, status, type, location, latitude, longitude)
       VALUES 
       (?, 'Engineering Physics Textbook', 'Textbook by Halliday & Resnick. Very good condition, useful for first-year engineering students. Donating for free to anyone in need.', 'Textbooks', 'Like New', 'AVAILABLE', 'DONATION', 'Ruhuna Faculty of Engineering, Galle', 6.0329, 80.2144),
       (?, 'Scientific Calculator CASIO fx-991ES Plus', 'Need a scientific calculator for the end semester exams. If anyone has a spare calculator or wants to sell/donate, please let me know.', 'Calculators', 'Good', 'AVAILABLE', 'REQUEST', 'Faculty of Technology Hostel, Karagoda Uyangoda', 6.0710, 80.5760),
       (?, 'Scientific Calculator CASIO fx-991EX', 'I have a working scientific calculator from my son\\'s previous exams. Willing to donate it to a student in need.', 'Calculators', 'Good', 'AVAILABLE', 'DONATION', 'Matara Town', 6.0410, 80.5360)`,
      [userIds['student2@skillbridge.demo'], userIds['student@skillbridge.demo'], userIds['community2@skillbridge.demo']]
    );
    
    // Insert demo application and rating (to make profile statistics look realistic immediately)
    console.log('Inserting historic completed jobs and ratings for demo data...');
    // Let's insert a completed job where Alex worked for Kasun Perera
    const [historicJobRes] = await connection.query(
      `INSERT INTO jobs (gig_id, poster_id, worker_id, title, description, budget, status)
       VALUES (NULL, ?, ?, 'Design Logo for Printing Business', 'Design a premium high-resolution logo for ABC Printing.', 3500.00, 'COMPLETED')`,
      [userIds['community@skillbridge.demo'], userIds['student@skillbridge.demo']]
    );
    const historicJobId = historicJobRes.insertId;
    
    // Add ratings from Kasun to Alex
    await connection.query(
      `INSERT INTO ratings (job_id, reviewer_id, reviewee_id, rating_value, feedback)
       VALUES (?, ?, ?, 5, 'Excellent design! Alex was extremely fast, professional, and delivered the exact logo we wanted.')`,
      [historicJobId, userIds['community@skillbridge.demo'], userIds['student@skillbridge.demo']]
    );

    // Let's insert another completed job where Nimal worked for Kasun Perera
    const [historicJobRes2] = await connection.query(
      `INSERT INTO jobs (gig_id, poster_id, worker_id, title, description, budget, status)
       VALUES (NULL, ?, ?, 'Excel Data Entry and Cleanup', 'Clean up Excel spreadsheet containing printing sales records.', 5000.00, 'COMPLETED')`,
      [userIds['community@skillbridge.demo'], userIds['student2@skillbridge.demo']]
    );
    const historicJobId2 = historicJobRes2.insertId;

    await connection.query(
      `INSERT INTO ratings (job_id, reviewer_id, reviewee_id, rating_value, feedback)
       VALUES (?, ?, ?, 4, 'Very organized and precise data entry. Highly recommended.')`,
      [historicJobId2, userIds['community@skillbridge.demo'], userIds['student2@skillbridge.demo']]
    );
    
    // Insert some messages to seed conversations
    console.log('Inserting seed messages...');
    await connection.query(
      `INSERT INTO messages (sender_id, receiver_id, content, is_read)
       VALUES 
       (?, ?, 'Hi Kasun, I saw your gig for the promotional flyer. I have graphic design experience, could you share the brand colors?', 1),
       (?, ?, 'Hi Alex, yes! Our brand colors are royal blue and white. Let me know if you want to apply, I\\'d love to see your portfolio.', 0)`,
      [userIds['student@skillbridge.demo'], userIds['community@skillbridge.demo'], userIds['community@skillbridge.demo'], userIds['student@skillbridge.demo']]
    );
    
    // Insert notifications
    console.log('Inserting notifications...');
    await connection.query(
      `INSERT INTO notifications (user_id, title, content, is_read)
       VALUES 
       (?, 'Welcome to SkillBridge!', 'Start by building your profile and exploring gigs around Matara.', 0),
       (?, 'Welcome to SkillBridge!', 'You can now post gigs, find local student talent, or list boarding houses.', 0)`,
      [userIds['student@skillbridge.demo'], userIds['community@skillbridge.demo']]
    );
    
    console.log('Database initialization and seeding completed successfully!');
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

init();
