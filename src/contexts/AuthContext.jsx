import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('AuthContext init - token:', token ? 'exists' : 'none', 'savedUser:', savedUser ? 'exists' : 'none'); // Debug log
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('AuthContext init - parsed user:', userData); // Debug log
          setUser(userData);
          setIsAuthenticated(true);
          
          // Connect WebSocket for already authenticated users
          socketService.connect(token, userData.id, userData.role);
          
          console.log('AuthContext init - set authenticated to true'); // Debug log
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    // Add a small delay to ensure localStorage is available
    setTimeout(initializeAuth, 100);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      console.log('Login response:', response.data); // Debug log
      
      if (response.data.success) {
        const { user: userData, accessToken } = response.data.data;
        
        console.log('User data:', userData); // Debug log
        console.log('Access token:', accessToken); // Debug log
        
        // Save to localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        // Connect WebSocket after successful login
        socketService.connect(accessToken, userData.id, userData.role);
        
        // Emit user login event
        socketService.emitUserLogin({
          userId: userData.id,
          userName: `${userData.firstName} ${userData.lastName}`,
          userRole: userData.role,
          timestamp: new Date().toISOString()
        });
        
        console.log('Auth state updated - isAuthenticated:', true); // Debug log
        
        toast.success('Login successful!');
        return { success: true, user: userData };
      } else {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Emit user logout event before disconnecting
    if (user) {
      socketService.emitUserLogout({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        timestamp: new Date().toISOString()
      });
    }
    
    // Disconnect WebSocket
    socketService.disconnect();
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  // Register function (admin only)
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        toast.success('User registered successfully!');
        return { success: true, user: response.data.user };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Get user profile
  const getProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Get profile error:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole(['SUPER_ADMIN', 'ADMIN']);
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return hasRole('SUPER_ADMIN');
  };

  // Check if user is student
  const isStudent = () => {
    return hasRole('STUDENT');
  };

  // Check if user is moderator
  const isModerator = () => {
    return hasRole('MODERATOR');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    getProfile,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isStudent,
    isModerator,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 