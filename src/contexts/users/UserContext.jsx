import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const UserContext = createContext();

const initialState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  filters: {
    department: 'all',
    role: 'all',
    status: 'all'
  }
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const createUser = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Transform frontend data to match backend expectations
      // The backend auth/register route only expects: email, password, firstName, lastName, role
      const backendUserData = {
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email,
        password: userData.password || 'TempPassword123!',
        role: (userData.role || 'employee').toLowerCase() // Backend expects lowercase roles
      };
      
      console.log('Sending user data to backend:', backendUserData);
      
      const response = await adminAPI.createUser(backendUserData);
      const newUser = response.data.data || response.data;
      
      dispatch({ type: 'ADD_USER', payload: newUser });
      dispatch({ type: 'SET_LOADING', payload: false });
      return newUser;
    } catch (error) {
      console.error('Create user error:', error);
      console.error('Error response:', error.response?.data);
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Transform frontend data to match backend expectations
      const backendUpdates = {
        ...updates
      };
      
      // Handle name field splitting if provided
      if (updates.name && !updates.firstName && !updates.lastName) {
        const nameParts = updates.name.split(' ');
        backendUpdates.firstName = nameParts[0] || '';
        backendUpdates.lastName = nameParts.slice(1).join(' ') || '';
        delete backendUpdates.name;
      }
      
      const response = await adminAPI.updateUser(userId, backendUpdates);
      const updatedUser = response.data.data || response.data;
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      dispatch({ type: 'SET_LOADING', payload: false });
      return updatedUser;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const getUsers = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await adminAPI.getAllUsers(filters);
      const users = response.data.data || response.data;
      
      // Transform backend data to include combined name field for frontend compatibility
      const transformedUsers = users.map(user => ({
        ...user,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.firstName || user.lastName || ''),
        status: user.isActive ? 'active' : 'inactive'
      }));
      
      dispatch({ type: 'SET_USERS', payload: transformedUsers });
      dispatch({ type: 'SET_LOADING', payload: false });
      return transformedUsers;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const getUserById = async (userId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await adminAPI.getUserDetails(userId);
      const user = response.data.data || response.data;
      
      // Transform backend data to include combined name field
      const transformedUser = {
        ...user,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.firstName || user.lastName || ''),
        status: user.isActive ? 'active' : 'inactive'
      };
      
      dispatch({ type: 'SET_CURRENT_USER', payload: transformedUser });
      dispatch({ type: 'SET_LOADING', payload: false });
      return transformedUser;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await adminAPI.deleteUser(userId);
      
      // Remove user from local state
      const updatedUsers = state.users.filter(user => user.id !== userId);
      dispatch({ type: 'SET_USERS', payload: updatedUsers });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || error.message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const value = {
    ...state,
    createUser,
    updateUser,
    getUsers,
    getUserById,
    deleteUser,
    setFilters
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 