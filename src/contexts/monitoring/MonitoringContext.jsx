import React, { createContext, useContext, useReducer, useEffect } from 'react';

const MonitoringContext = createContext();

const initialState = {
  systemHealth: 'healthy',
  metrics: {
    cpu: 12,
    memory: 45,
    disk: 60,
    uptime: 123456,
    apiLatency: 120,
    errorRate: 0.2
  },
  alerts: [],
  isLoading: false,
  error: null
};

const monitoringReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_HEALTH':
      return { ...state, systemHealth: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    default:
      return state;
  }
};

export const MonitoringProvider = ({ children }) => {
  const [state, dispatch] = useReducer(monitoringReducer, initialState);

  const fetchMetrics = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Simulate API call
      const metrics = {
        cpu: Math.round(Math.random() * 100),
        memory: Math.round(Math.random() * 100),
        disk: Math.round(Math.random() * 100),
        uptime: state.metrics.uptime + 60,
        apiLatency: Math.round(Math.random() * 200),
        errorRate: Math.random()
      };
      dispatch({ type: 'SET_METRICS', payload: metrics });
      dispatch({ type: 'SET_LOADING', payload: false });
      return metrics;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const fetchAlerts = async () => {
    try {
      // Simulate API call
      const alerts = [
        { id: 1, type: 'warning', message: 'High CPU usage detected', timestamp: new Date().toISOString() },
        { id: 2, type: 'info', message: 'System running smoothly', timestamp: new Date().toISOString() }
      ];
      dispatch({ type: 'SET_ALERTS', payload: alerts });
      return alerts;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const checkSystemHealth = async () => {
    try {
      // Simulate health check
      const health = Math.random() > 0.1 ? 'healthy' : 'degraded';
      dispatch({ type: 'SET_HEALTH', payload: health });
      return health;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchAlerts();
    checkSystemHealth();
    // Optionally poll metrics every minute
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    ...state,
    fetchMetrics,
    fetchAlerts,
    checkSystemHealth
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};