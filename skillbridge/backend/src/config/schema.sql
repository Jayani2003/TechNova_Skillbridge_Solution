DROP DATABASE IF EXISTS skillbridge;
CREATE DATABASE skillbridge;
USE skillbridge;

-- 1. Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  user_type ENUM('STUDENT', 'COMMUNITY_MEMBER') NOT NULL,
  profile_image VARCHAR(255) NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) DEFAULT 6.0535, -- default near Matara/Galle area
  longitude DECIMAL(11, 8) DEFAULT 80.5332,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Student Profiles
CREATE TABLE student_profiles (
  user_id INT PRIMARY KEY,
  university VARCHAR(150) NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  degree_program VARCHAR(100) NOT NULL,
  availability VARCHAR(100) NOT NULL DEFAULT 'Weekends',
  expected_rate DECIMAL(10, 2) DEFAULT 0.00,
  bio TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Community Profiles
CREATE TABLE community_profiles (
  user_id INT PRIMARY KEY,
  occupation VARCHAR(100) NOT NULL,
  business_name VARCHAR(150) NULL,
  services TEXT NULL,
  bio TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. User Skills Table
CREATE TABLE user_skills (
  user_id INT NOT NULL,
  skill_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (user_id, skill_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Gigs Table
CREATE TABLE gigs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poster_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(20) DEFAULT 'Fixed',
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) DEFAULT 6.0535,
  longitude DECIMAL(11, 8) DEFAULT 80.5332,
  deadline DATE NOT NULL,
  duration VARCHAR(50) NOT NULL,
  status ENUM('OPEN', 'APPLIED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Gig Skills Table
CREATE TABLE gig_skills (
  gig_id INT NOT NULL,
  skill_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (gig_id, skill_name),
  FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
);

-- 7. Applications Table
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gig_id INT NOT NULL,
  applicant_id INT NOT NULL,
  cover_message TEXT NOT NULL,
  proposed_price DECIMAL(10, 2) NOT NULL,
  estimated_duration VARCHAR(50) NOT NULL,
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
  FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_app (gig_id, applicant_id)
);

-- 8. Jobs Table (representing active contract jobs)
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gig_id INT NULL, -- Null if direct hire
  poster_id INT NOT NULL,
  worker_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  status ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'IN_PROGRESS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE SET NULL,
  FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Ratings Table
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  feedback TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Boarding Table
CREATE TABLE boarding (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poster_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  distance_from_faculty DECIMAL(5, 2) NOT NULL, -- distance in km
  available_date DATE NOT NULL,
  rooms_count INT NOT NULL DEFAULT 1,
  facilities TEXT NOT NULL, -- comma-separated
  contact_method VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) DEFAULT 6.0535,
  longitude DECIMAL(11, 8) DEFAULT 80.5332,
  status ENUM('AVAILABLE', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Resources Table (Donations and Requests)
CREATE TABLE resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  item_condition VARCHAR(50) NOT NULL DEFAULT 'Good',
  status ENUM('AVAILABLE', 'DONATED', 'RECLAIMED') DEFAULT 'AVAILABLE',
  type ENUM('DONATION', 'REQUEST') NOT NULL DEFAULT 'DONATION',
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) DEFAULT 6.0535,
  longitude DECIMAL(11, 8) DEFAULT 80.5332,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Messages Table
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. Notifications Table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sender_id INT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  related_id INT NULL,
  related_type VARCHAR(50) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
