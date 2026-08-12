import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Gigs from './pages/Gigs';
import FindTalent from './pages/FindTalent';
import Nearby from './pages/Nearby';
import Boarding from './pages/Boarding';
import DonateResources from './pages/DonateResources';
import MyJobs from './pages/MyJobs';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route wrapper for Main Layout injection
const LayoutWrapper = ({ children }) => {
  return (
    <ProtectedRoute>
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Navigation Layout */}
          <Route path="/dashboard" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
          <Route path="/gigs" element={<LayoutWrapper><Gigs /></LayoutWrapper>} />
          <Route path="/talent" element={<LayoutWrapper><FindTalent /></LayoutWrapper>} />
          <Route path="/nearby" element={<LayoutWrapper><Nearby /></LayoutWrapper>} />
          <Route path="/boarding" element={<LayoutWrapper><Boarding /></LayoutWrapper>} />
          <Route path="/resources" element={<LayoutWrapper><DonateResources /></LayoutWrapper>} />
          <Route path="/my-jobs" element={<LayoutWrapper><MyJobs /></LayoutWrapper>} />
          <Route path="/messages" element={<LayoutWrapper><Messages /></LayoutWrapper>} />
          <Route path="/notifications" element={<LayoutWrapper><Notifications /></LayoutWrapper>} />
          <Route path="/profile" element={<LayoutWrapper><Profile /></LayoutWrapper>} />

          {/* Fallback Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
