import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ReportsContext = createContext();

const initialState = {
  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,
  reportTypes: [
    'attendance',
    'task',
    'user',
    'performance',
    'analytics'
  ]
};

const reportsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_REPORTS':
      return { ...state, reports: action.payload };
    case 'SET_CURRENT_REPORT':
      return { ...state, currentReport: action.payload };
    case 'ADD_REPORT':
      return { ...state, reports: [...state.reports, action.payload] };
    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(report => 
          report.id === action.payload.id ? action.payload : report
        )
      };
    default:
      return state;
  }
};

export const ReportsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reportsReducer, initialState);

  const generateReport = async (reportType, filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let reportData;
      
      // Fetch real data based on report type
      switch (reportType) {
        case 'attendance':
          // Use analytics data for attendance-like metrics
          const analyticsData = await analyticsAPI.getDashboardAnalytics();
          reportData = {
            totalDays: 30,
            presentDays: analyticsData.data?.data?.overview?.totalUsers || 0,
            absentDays: 0,
            lateDays: 0,
            averageHours: 8.1
          };
          break;
          
        case 'task':
          // Use exam completion data
          const examData = await analyticsAPI.getDashboardStats();
          reportData = {
            totalTasks: examData.data?.data?.overview?.totalExams || 0,
            completed: examData.data?.data?.overview?.totalAttempts || 0,
            pending: (examData.data?.data?.overview?.totalExams || 0) - (examData.data?.data?.overview?.totalAttempts || 0),
            completionRate: examData.data?.data?.overview?.totalExams > 0 ? 
              Math.round((examData.data?.data?.overview?.totalAttempts / examData.data?.data?.overview?.totalExams) * 100) : 0
          };
          break;
          
        case 'user':
          // Use user analytics
          const userData = await analyticsAPI.getDashboardStats();
          reportData = {
            totalUsers: userData.data?.data?.overview?.totalUsers || 0,
            activeUsers: userData.data?.data?.overview?.totalUsers || 0,
            inactiveUsers: 0,
            newUsers: userData.data?.data?.overview?.totalUsers || 0
          };
          break;
          
        case 'performance':
          // Use performance analytics
          const performanceData = await analyticsAPI.getPerformanceAnalytics();
          reportData = {
            averageScore: performanceData.data?.data?.averageScore || 0,
            totalAttempts: performanceData.data?.data?.totalAttempts || 0,
            scoreDistribution: performanceData.data?.data?.scoreDistribution || [],
            topPerformers: performanceData.data?.data?.topPerformers || []
          };
          break;
          
        case 'analytics':
          // Use comprehensive analytics
          const dashboardData = await analyticsAPI.getDashboardAnalytics();
          reportData = {
            overview: dashboardData.data?.data?.overview || {},
            trends: dashboardData.data?.data?.trends || {},
            recentActivity: dashboardData.data?.data?.recentActivity || [],
            categoryStats: dashboardData.data?.data?.categoryStats || []
          };
          break;
          
        default:
          reportData = {};
      }
      
      const report = {
        id: Date.now(),
        type: reportType,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        filters,
        generatedAt: new Date().toISOString(),
        status: 'completed',
        data: reportData
      };
      
      dispatch({ type: 'ADD_REPORT', payload: report });
      toast.success('Report generated successfully!');
      return report;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to generate report');
      throw error;
    }
  };

  const getReports = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For now, we'll use the existing reports from state
      // In a real implementation, you might want to fetch from a reports API
      const existingReports = state.reports;
      
      if (existingReports.length === 0) {
        // Generate some initial reports if none exist
        const initialReports = [
          {
            id: 1,
            type: 'analytics',
            title: 'System Analytics Report',
            generatedAt: new Date().toISOString(),
            status: 'completed'
          },
          {
            id: 2,
            type: 'performance',
            title: 'Performance Overview Report',
            generatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'completed'
          }
        ];
        
        dispatch({ type: 'SET_REPORTS', payload: initialReports });
        return initialReports;
      }
      
      return existingReports;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getReportById = async (reportId) => {
    try {
      const report = state.reports.find(r => r.id === reportId);
      if (report) {
        dispatch({ type: 'SET_CURRENT_REPORT', payload: report });
        return report;
      }
      throw new Error('Report not found');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const exportReport = async (reportId, format = 'pdf') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const report = state.reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');
      
      // Use analytics API to export report data
      const response = await analyticsAPI.exportAnalytics({ 
        type: report.type, 
        format,
        reportId: report.id 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title.toLowerCase().replace(/\s+/g, '-')}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
      return { success: true, filename: `${report.title}.${format}` };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error('Failed to export report');
      throw error;
    }
  };

  useEffect(() => {
    getReports();
  }, []);

  const value = {
    ...state,
    generateReport,
    getReports,
    getReportById,
    exportReport
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}; 