import React, { createContext, useContext, useReducer } from 'react';

const AIContext = createContext();

const initialState = {
  aiStatus: 'idle',
  lastPrediction: null,
  isLoading: false,
  error: null
};

const aiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_STATUS':
      return { ...state, aiStatus: action.payload };
    case 'SET_PREDICTION':
      return { ...state, lastPrediction: action.payload };
    default:
      return state;
  }
};

export const AIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  const predictAttendance = async (input) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_STATUS', payload: 'predicting' });
      // Simulate AI prediction
      await new Promise(resolve => setTimeout(resolve, 1000));
      const prediction = {
        probability: Math.random(),
        label: Math.random() > 0.5 ? 'present' : 'absent',
        input
      };
      dispatch({ type: 'SET_PREDICTION', payload: prediction });
      dispatch({ type: 'SET_STATUS', payload: 'idle' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return prediction;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      throw error;
    }
  };

  const value = {
    ...state,
    predictAttendance
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};