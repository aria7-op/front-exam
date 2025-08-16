import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import { useAuth } from '../../contexts/auth/AuthContext';
import '../../styles/layouts/student.css';

const StudentLayout = ({ currentView, setCurrentView }) => {
  const location = useLocation();

  const navItems = [
    {
      path: '/student',
      label: 'Dashboard',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      path: '/student/tests',
      label: 'Available Tests',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: '/student/history',
      label: 'Test History',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: '/student/profile',
      label: 'Profile',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'Dashboard';
  };

  return (
    <div className="student-layout">
      {/* Sidebar */}
      <div className="student-sidebar">
        <div className="admin-logo">
          <h1>Student Portal</h1>
        </div>
        
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="student-main">
        <div className="student-header">
          <h2>{getPageTitle()}</h2>
          <div className="header-actions">
            {/* Notifications */}
            <NotificationCenter />
            
            <div className="view-toggle">
              <button
                className={`toggle-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                Admin
              </button>
              <button
                className={`toggle-btn ${currentView === 'student' ? 'active' : ''}`}
                onClick={() => setCurrentView('student')}
              >
                Student
              </button>
            </div>
          </div>
        </div>
        
        <div className="student-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout; 