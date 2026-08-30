const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authMiddleware = require('./middleware/auth');

// Controllers
const authController = require('./controllers/authController');
const gigController = require('./controllers/gigController');
const talentController = require('./controllers/talentController');
const jobController = require('./controllers/jobController');
const boardingController = require('./controllers/boardingController');
const resourceController = require('./controllers/resourceController');
const messageController = require('./controllers/messageController');
const notificationController = require('./controllers/notificationController');
const nearbyController = require('./controllers/nearbyController');
const impactController = require('./controllers/impactController');
const adminController = require('./controllers/adminController');
const adminAuth = require('./middleware/adminAuth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the SkillBridge API. Everything is running smoothly!' });
});

// ==========================================
// ROUTES
// ==========================================

// 1. Authentication & Profiles
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authMiddleware, authController.getMe);
app.put('/api/auth/profile', authMiddleware, authController.updateProfile);

// 2. Gigs & Applications
app.get('/api/gigs', gigController.getAllGigs);
app.post('/api/gigs', authMiddleware, gigController.createGig);
app.get('/api/gigs/:id', gigController.getGigById);
app.post('/api/gigs/:id/apply', authMiddleware, gigController.applyToGig);
app.get('/api/gigs/:id/applications', authMiddleware, gigController.getGigApplications);
app.put('/api/applications/:id', authMiddleware, gigController.updateApplicationStatus);

// 3. Find Talent / Users Search (Double-bound mapping for endpoint flexibility)
app.get('/api/talents', talentController.getAllTalents);
app.get('/api/talents/:id', talentController.getTalentById);
app.get('/api/users', talentController.getAllTalents);
app.get('/api/users/:id', talentController.getTalentById);

// 4. Active Jobs & Direct Hiring
app.get('/api/jobs', authMiddleware, jobController.getAllJobs);
app.get('/api/jobs/:id', authMiddleware, jobController.getJobById);
app.put('/api/jobs/:id/status', authMiddleware, jobController.updateJobStatus);
app.post('/api/jobs/:id/rate', authMiddleware, jobController.createRating);
app.post('/api/jobs/:id/dispute', authMiddleware, jobController.reportDispute);

app.post('/api/hire', authMiddleware, jobController.hireDirectly);
app.post('/api/hire/respond', authMiddleware, jobController.acceptDirectHire);

// 5. Boarding Lodging
app.get('/api/boarding', boardingController.getAllBoardings);
app.post('/api/boarding', authMiddleware, boardingController.createBoarding);
app.get('/api/boarding/:id', boardingController.getBoardingById);
app.put('/api/boarding/:id', authMiddleware, boardingController.updateBoarding);
app.patch('/api/boarding/:id/status', authMiddleware, boardingController.toggleBoardingStatus);
app.delete('/api/boarding/:id', authMiddleware, boardingController.deleteBoarding);

// 6. Resources & Donations
app.get('/api/resources', resourceController.getAllResources);
app.post('/api/resources', authMiddleware, resourceController.createResource);
app.get('/api/resources/:id', resourceController.getResourceById);
app.put('/api/resources/:id/status', authMiddleware, resourceController.updateResourceStatus);

// 7. Direct Messaging
app.get('/api/messages', authMiddleware, messageController.getMessages);
app.post('/api/messages', authMiddleware, messageController.sendMessage);
app.get('/api/messages/conversations', authMiddleware, messageController.getConversations);

// 8. Notifications
app.get('/api/notifications', authMiddleware, notificationController.getAllNotifications);
app.put('/api/notifications/:id/read', authMiddleware, notificationController.markAsRead);
app.put('/api/notifications/read-all', authMiddleware, notificationController.markAllAsRead);

// 9. Nearby Opportunities (Geotagged List)
app.get('/api/opportunities/nearby', nearbyController.getNearbyOpportunities);

// 10. Impact Dashboards
app.get('/api/impact', impactController.getGlobalImpact);
app.get('/api/impact/users/:id', impactController.getUserImpact);

// 11. Admin Panel
app.get('/api/admin/stats', authMiddleware, adminAuth, adminController.getStats);
app.get('/api/admin/users', authMiddleware, adminAuth, adminController.getUsers);
app.delete('/api/admin/users/:id', authMiddleware, adminAuth, adminController.deleteUser);
app.get('/api/admin/gigs', authMiddleware, adminAuth, adminController.getGigs);
app.delete('/api/admin/gigs/:id', authMiddleware, adminAuth, adminController.deleteGig);

// Advanced Admin Features
app.get('/api/admin/verification/students', authMiddleware, adminAuth, adminController.getUnverifiedStudents);
app.put('/api/admin/verification/students/:id/verify', authMiddleware, adminAuth, adminController.verifyStudent);

app.get('/api/admin/disputes/jobs', authMiddleware, adminAuth, adminController.getDisputedJobs);
app.put('/api/admin/disputes/jobs/:id/resolve', authMiddleware, adminAuth, adminController.resolveDispute);

app.get('/api/admin/resources', authMiddleware, adminAuth, adminController.getResources);
app.delete('/api/admin/resources/:id', authMiddleware, adminAuth, adminController.deleteResource);

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err);
  res.status(500).json({ message: 'Internal Server Error. Please contact support.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` SkillBridge Backend Server listening on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Mode: Development`);
  console.log(`==================================================`);
});
