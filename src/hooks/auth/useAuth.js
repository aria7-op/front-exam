import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      const userData = localStorage.getItem('user');
      
      setIsAuthenticated(authStatus);
      setUser(userData ? JSON.parse(userData) : null);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: 1,
        name: 'John Doe',
        email: email,
        role: 'employee'
      };
      
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  const register = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register
  };
}; 