import React from 'react';
import ExamCalendar from '../../components/calendar/ExamCalendar';
import { useAuth } from '../../contexts/AuthContext';
import './Calendar.css';

const Calendar = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="calendar-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-page-header">
        <div className="page-title">
          <h1>Exam Calendar</h1>
          <p>Manage exam schedules and bookings</p>
        </div>
        
        <div className="page-actions">
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="calendar-page-content">
        <ExamCalendar />
      </div>
    </div>
  );
};

export default Calendar;