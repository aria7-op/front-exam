import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import ExamLayout from './layouts/ExamLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Tests from './pages/admin/Tests';
import Questions from './pages/admin/Questions';
import Users from './pages/admin/Users';
import TestBookings from './pages/admin/TestBookings';
import Reports from './pages/admin/Reports';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentTests from './pages/student/Tests';
import AvailableTests from './pages/student/AvailableTests';
import StudentHistory from './pages/student/History';
import StudentCertificates from './pages/student/Certificates';
import StudentProfile from './pages/student/Profile';

// Exam Pages
import ExamInterface from './pages/exam/ExamInterface';
import ExamResults from './pages/exam/ExamResults';

// Components
import LoadingScreen from './components/common/LoadingScreen';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    if (user?.role === 'STUDENT') {
      return <Navigate to="/student" replace />;
    } else if (['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user?.role)) {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
};

// Role-based Route Component
const RoleBasedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) return null;

  // Admin routes
  if (['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user.role)) {
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  // Student routes
  if (user.role === 'STUDENT') {
    return <StudentLayout>{children}</StudentLayout>;
  }

  return null;
};

function App() {
  const { isAuthenticated, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  console.log('App render - isAuthenticated:', isAuthenticated, 'user:', user, 'loading:', loading); // Debug log

  // Don't render anything until auth context has finished loading
  if (loading) {
    console.log('App - still loading auth context'); // Debug log
    return <LoadingScreen />;
  }

  // If not authenticated, only show login page
  if (!isAuthenticated || !user) {
    return (
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app">
      {isLoading && <LoadingScreen />}
      
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MODERATOR']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tests" element={<Tests />} />
          <Route path="questions" element={<Questions />} />
          <Route path="users" element={<Users />} />
          <Route path="bookings" element={<TestBookings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="tests" element={<AvailableTests />} />
          <Route path="history" element={<StudentHistory />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Exam Routes */}
        <Route path="/exam" element={
          <ProtectedRoute>
            <ExamLayout />
          </ProtectedRoute>
        }>
          <Route path=":testId" element={<ExamInterface />} />
          <Route path="results/:resultId" element={<ExamResults />} />
        </Route>

        {/* Default redirect based on user role */}
        <Route path="/" element={
          user?.role === 'STUDENT' ? 
            <Navigate to="/student" replace /> : 
            <Navigate to="/admin" replace />
        } />
        
        {/* Catch all route */}
        <Route path="*" element={
          user?.role === 'STUDENT' ? 
            <Navigate to="/student" replace /> : 
            <Navigate to="/admin" replace />
        } />
      </Routes>
    </div>
  );
}

export default App; 