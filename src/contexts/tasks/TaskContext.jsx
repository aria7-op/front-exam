import React, { createContext, useContext, useReducer, useEffect } from 'react';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    assignee: 'all'
  }
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_CURRENT_TASK':
      return { ...state, currentTask: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const createTask = async (taskData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newTask = {
        id: Date.now(),
        title: taskData.title,
        description: taskData.description || '',
        status: 'pending',
        priority: taskData.priority || 'medium',
        assignee: taskData.assignee || null,
        dueDate: taskData.dueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_TASK', payload: newTask });
      return newTask;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedTask = {
        ...state.tasks.find(task => task.id === taskId),
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      return updatedTask;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getTasks = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      const tasks = [
        {
          id: 1,
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation for the smart attendance system',
          status: 'in-progress',
          priority: 'high',
          assignee: 'John Doe',
          dueDate: '2024-01-20',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          title: 'Review code changes',
          description: 'Review and approve recent code changes',
          status: 'pending',
          priority: 'medium',
          assignee: 'Jane Smith',
          dueDate: '2024-01-18',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        }
      ];
      
      dispatch({ type: 'SET_TASKS', payload: tasks });
      return tasks;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getTaskById = async (taskId) => {
    try {
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        dispatch({ type: 'SET_CURRENT_TASK', payload: task });
        return task;
      }
      throw new Error('Task not found');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  useEffect(() => {
    getTasks();
  }, []);

  const value = {
    ...state,
    createTask,
    updateTask,
    getTasks,
    getTaskById,
    setFilters
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}; 