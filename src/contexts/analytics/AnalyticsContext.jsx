import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AnalyticsContext = createContext();

const initialState = {
  attendanceStats: {},
  taskStats: {},
  userStats: {},
  isLoading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  }
};

const analyticsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_ATTENDANCE_STATS':
      return { ...state, attendanceStats: action.payload };
    case 'SET_TASK_STATS':
      return { ...state, taskStats: action.payload };
    case 'SET_USER_STATS':
      return { ...state, userStats: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    default:
      return state;
  }
};

export const AnalyticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  const getAttendanceStats = async (dateRange = state.dateRange) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      const stats = {
        totalCheckIns: 150,
        totalCheckOuts: 145,
        averageHours: 8.2,
        lateArrivals: 12,
        earlyDepartures: 8,
        attendanceRate: 96.7,
        overtimeHours: 45
      };
      
      dispatch({ type: 'SET_ATTENDANCE_STATS', payload: stats });
      return stats;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getTaskStats = async (dateRange = state.dateRange) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      const stats = {
        totalTasks: 85,
        completedTasks: 72,
        pendingTasks: 13,
        completionRate: 84.7,
        averageCompletionTime: 3.2,
        overdueTasks: 5
      };
      
      dispatch({ type: 'SET_TASK_STATS', payload: stats });
      return stats;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getUserStats = async (dateRange = state.dateRange) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      const stats = {
        totalUsers: 25,
        activeUsers: 23,
        newUsers: 3,
        userActivityRate: 92.0,
        topPerformers: ['John Doe', 'Jane Smith', 'Mike Johnson']
      };
      
      dispatch({ type: 'SET_USER_STATS', payload: stats });
      return stats;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const setDateRange = (dateRange) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: dateRange });
  };

  const refreshAllStats = async () => {
    await Promise.all([
      getAttendanceStats(),
      getTaskStats(),
      getUserStats()
    ]);
  };

  useEffect(() => {
    refreshAllStats();
  }, []);

  const value = {
    ...state,
    getAttendanceStats,
    getTaskStats,
    getUserStats,
    setDateRange,
    refreshAllStats
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}; 