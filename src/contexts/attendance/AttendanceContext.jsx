import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AttendanceContext = createContext();

const initialState = {
  currentAttendance: null,
  attendanceHistory: [],
  isLoading: false,
  error: null,
  todayStats: {
    checkInTime: null,
    checkOutTime: null,
    totalHours: 0,
    status: 'not-checked-in'
  }
};

const attendanceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CURRENT_ATTENDANCE':
      return { ...state, currentAttendance: action.payload };
    case 'SET_ATTENDANCE_HISTORY':
      return { ...state, attendanceHistory: action.payload };
    case 'SET_TODAY_STATS':
      return { ...state, todayStats: action.payload };
    case 'CHECK_IN':
      return {
        ...state,
        currentAttendance: action.payload,
        todayStats: {
          ...state.todayStats,
          checkInTime: action.payload.checkInTime,
          status: 'checked-in'
        }
      };
    case 'CHECK_OUT':
      return {
        ...state,
        currentAttendance: null,
        todayStats: {
          ...state.todayStats,
          checkOutTime: action.payload.checkOutTime,
          totalHours: action.payload.totalHours,
          status: 'checked-out'
        }
      };
    default:
      return state;
  }
};

export const AttendanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  const checkIn = async (data = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      const checkInData = {
        id: Date.now(),
        checkInTime: new Date().toISOString(),
        location: data.location || 'Office',
        method: data.method || 'manual',
        ...data
      };
      
      dispatch({ type: 'CHECK_IN', payload: checkInData });
      return checkInData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const checkOut = async (data = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const checkOutTime = new Date().toISOString();
      const checkInTime = state.currentAttendance?.checkInTime;
      const totalHours = checkInTime 
        ? (new Date(checkOutTime) - new Date(checkInTime)) / (1000 * 60 * 60)
        : 0;
      
      const checkOutData = {
        checkOutTime,
        totalHours: Math.round(totalHours * 100) / 100,
        ...data
      };
      
      dispatch({ type: 'CHECK_OUT', payload: checkOutData });
      return checkOutData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getAttendanceHistory = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      const history = [
        {
          id: 1,
          date: '2024-01-15',
          checkInTime: '09:00:00',
          checkOutTime: '17:00:00',
          totalHours: 8,
          status: 'completed'
        },
        {
          id: 2,
          date: '2024-01-14',
          checkInTime: '08:30:00',
          checkOutTime: '16:30:00',
          totalHours: 8,
          status: 'completed'
        }
      ];
      
      dispatch({ type: 'SET_ATTENDANCE_HISTORY', payload: history });
      return history;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getTodayStats = async () => {
    try {
      // Simulate API call to get today's attendance stats
      const stats = {
        checkInTime: state.currentAttendance?.checkInTime || null,
        checkOutTime: null,
        totalHours: 0,
        status: state.currentAttendance ? 'checked-in' : 'not-checked-in'
      };
      
      dispatch({ type: 'SET_TODAY_STATS', payload: stats });
      return stats;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  useEffect(() => {
    getTodayStats();
  }, []);

  const value = {
    ...state,
    checkIn,
    checkOut,
    getAttendanceHistory,
    getTodayStats
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}; 