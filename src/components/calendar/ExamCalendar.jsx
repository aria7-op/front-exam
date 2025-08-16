import React, { useState, useEffect, useCallback } from 'react';
import './ExamCalendar.css';
import { API_BASE_URL } from '../../config/api.config';

const ExamCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    examCategory: 'all',
    showConfirmed: true,
    showPending: true,
    showCancelled: false
  });

  // Helper functions for date manipulation
  const formatDate = (date, formatStr = 'YYYY-MM-DD') => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    if (formatStr === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
    if (formatStr === 'MMMM YYYY') return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (formatStr === 'EEEE, MMMM d, yyyy') return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (formatStr === 'HH:mm') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (formatStr === 'd') return String(d.getDate());
    return d.toLocaleDateString();
  };

  const getMonthStart = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  };

  const getMonthEnd = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const isSameMonth = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
  };

  // Calendar navigation
  const navigateMonth = useCallback((direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  }, []);

  // Fetch bookings for the current month
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = getMonthStart(currentDate);
      const endDate = getMonthEnd(currentDate);
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000
      });

      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.examCategory !== 'all') {
        params.append('examCategoryId', filters.examCategory);
      }

      const response = await fetch(`${API_BASE_URL}/bookings/admin/calendar?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.data || []);
    } catch (error) {
      console.error('Error fetching calendar bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Get calendar days for the current month
  const getCalendarDays = () => {
    const monthStart = getMonthStart(currentDate);
    const monthEnd = getMonthEnd(currentDate);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);
    
    // Get first day of the week (Sunday = 0)
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Get last day of the week
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Get bookings for a specific date
  const getBookingsForDate = useCallback((date) => {
    return bookings.filter(booking => {
      if (!booking.scheduledAt) return false;
      return isSameDay(new Date(booking.scheduledAt), date);
    }).filter(booking => {
      if (!filters.showConfirmed && booking.status === 'CONFIRMED') return false;
      if (!filters.showPending && booking.status === 'PENDING') return false;
      if (!filters.showCancelled && booking.status === 'CANCELLED') return false;
      return true;
    });
  }, [bookings, filters]);

  // Get day status class
  const getDayStatusClass = (date) => {
    const dayBookings = getBookingsForDate(date);
    if (dayBookings.length === 0) return 'free';
    
    const hasConfirmed = dayBookings.some(b => b.status === 'CONFIRMED');
    const hasPending = dayBookings.some(b => b.status === 'PENDING');
    
    if (hasConfirmed && hasPending) return 'mixed';
    if (hasConfirmed) return 'confirmed';
    if (hasPending) return 'pending';
    return 'free';
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Get month statistics
  const getMonthStats = () => {
    const stats = {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      busyDays: 0,
      freeDays: 0
    };

    const monthStart = getMonthStart(currentDate);
    const monthEnd = getMonthEnd(currentDate);
    const days = [];
    const currentDay = new Date(monthStart);
    
    while (currentDay <= monthEnd) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    days.forEach(day => {
      const dayBookings = getBookingsForDate(day);
      if (dayBookings.length > 0) {
        stats.busyDays++;
        dayBookings.forEach(booking => {
          stats.total++;
          if (booking.status === 'CONFIRMED') stats.confirmed++;
          if (booking.status === 'PENDING') stats.pending++;
          if (booking.status === 'CANCELLED') stats.cancelled++;
        });
      } else {
        stats.freeDays++;
      }
    });

    return stats;
  };

  const monthStats = getMonthStats();
  const calendarDays = getCalendarDays();

  // Render calendar day
  const renderCalendarDay = (date) => {
    const dayBookings = getBookingsForDate(date);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const dayStatus = getDayStatusClass(date);

    return (
      <div
        key={date.toISOString()}
        className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday(date) ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayStatus}`}
        onClick={() => handleDateSelect(date)}
      >
        <div className="day-number">{formatDate(date, 'd')}</div>
        {dayBookings.length > 0 && (
          <div className="booking-indicators">
            <div className="booking-count">{dayBookings.length}</div>
            <div className="booking-dots">
              {dayBookings.slice(0, 3).map((booking, index) => (
                <div
                  key={booking.id}
                  className={`booking-dot ${booking.status.toLowerCase()}`}
                  title={`${booking.exam?.title} - ${booking.status}`}
                />
              ))}
              {dayBookings.length > 3 && <div className="more-indicator">+{dayBookings.length - 3}</div>}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render selected date details
  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;

    const dayBookings = getBookingsForDate(selectedDate);

    return (
      <div className="selected-date-details">
        <h3>{formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
        {dayBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="free-day-icon">📅</div>
            <p>No exams scheduled for this day</p>
            <button className="btn btn-primary" onClick={() => {/* Handle add booking */}}>
              Schedule Exam
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            <h4>{dayBookings.length} Exam{dayBookings.length !== 1 ? 's' : ''} Scheduled</h4>
            {dayBookings.map(booking => (
              <div key={booking.id} className={`booking-card ${booking.status.toLowerCase()}`}>
                <div className="booking-header">
                  <h5>{booking.exam?.title}</h5>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Student:</span>
                    <span>{booking.user?.firstName} {booking.user?.lastName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Time:</span>
                    <span>{formatDate(new Date(booking.scheduledAt), 'HH:mm')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Category:</span>
                    <span>{booking.exam?.examCategory?.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration:</span>
                    <span>{booking.exam?.duration} minutes</span>
                  </div>
                  {booking.notes && (
                    <div className="detail-item">
                      <span className="label">Notes:</span>
                      <span>{booking.notes}</span>
                    </div>
                  )}
                </div>
                <div className="booking-actions">
                  <button className="btn btn-sm btn-outline">View Details</button>
                  {booking.status === 'PENDING' && (
                    <>
                      <button className="btn btn-sm btn-success">Confirm</button>
                      <button className="btn btn-sm btn-danger">Cancel</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="exam-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          <h2>Exam Calendar</h2>
          <p>Manage and view exam schedules</p>
        </div>

        {/* Calendar Controls */}
        <div className="calendar-controls">
          <div className="month-navigation">
            <button className="nav-btn" onClick={() => navigateMonth('prev')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            <h3 className="current-month">{formatDate(currentDate, 'MMMM YYYY')}</h3>
            <button className="nav-btn" onClick={() => navigateMonth('next')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Stats */}
      <div className="calendar-stats">
        <div className="stat-card">
          <div className="stat-value">{monthStats.total}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-value">{monthStats.confirmed}</div>
          <div className="stat-label">Confirmed</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{monthStats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card free">
          <div className="stat-value">{monthStats.freeDays}</div>
          <div className="stat-label">Free Days</div>
        </div>
      </div>

      {/* Filters */}
      <div className="calendar-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="filter-toggles">
          <label className="toggle-filter">
            <input
              type="checkbox"
              checked={filters.showConfirmed}
              onChange={(e) => setFilters(prev => ({...prev, showConfirmed: e.target.checked}))}
            />
            <span>Show Confirmed</span>
          </label>
          <label className="toggle-filter">
            <input
              type="checkbox"
              checked={filters.showPending}
              onChange={(e) => setFilters(prev => ({...prev, showPending: e.target.checked}))}
            />
            <span>Show Pending</span>
          </label>
          <label className="toggle-filter">
            <input
              type="checkbox"
              checked={filters.showCancelled}
              onChange={(e) => setFilters(prev => ({...prev, showCancelled: e.target.checked}))}
            />
            <span>Show Cancelled</span>
          </label>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="calendar-content">
        {/* Calendar Grid */}
        <div className="calendar-grid">
          {loading ? (
            <div className="calendar-loading">
              <div className="loading-spinner"></div>
              <p>Loading calendar...</p>
            </div>
          ) : (
            <>
              {/* Calendar Header Days */}
              <div className="calendar-header-days">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="header-day">{day}</div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="calendar-days">
                {calendarDays.map(renderCalendarDay)}
              </div>
            </>
          )}
        </div>

        {/* Selected Date Sidebar */}
        <div className="calendar-sidebar">
          {renderSelectedDateDetails()}
          
          {/* Legend */}
          <div className="calendar-legend">
            <h4>Legend</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-dot free"></div>
                <span>Free Day</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot pending"></div>
                <span>Pending Bookings</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot confirmed"></div>
                <span>Confirmed Bookings</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot mixed"></div>
                <span>Mixed Status</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCalendar;