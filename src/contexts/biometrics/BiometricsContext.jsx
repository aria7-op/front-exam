import React, { createContext, useContext, useReducer, useEffect } from 'react';

const BiometricsContext = createContext();

const initialState = {
  isSupported: false,
  isEnabled: false,
  biometricData: null,
  isLoading: false,
  error: null
};

const biometricsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SUPPORTED':
      return { ...state, isSupported: action.payload };
    case 'SET_ENABLED':
      return { ...state, isEnabled: action.payload };
    case 'SET_BIOMETRIC_DATA':
      return { ...state, biometricData: action.payload };
    default:
      return state;
  }
};

export const BiometricsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(biometricsReducer, initialState);

  const checkBiometricSupport = async () => {
    try {
      // Check if WebAuthn is supported
      const isSupported = window.PublicKeyCredential && 
                         window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
                         await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      dispatch({ type: 'SET_SUPPORTED', payload: isSupported });
      return isSupported;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  const enableBiometrics = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate biometric enrollment
      const biometricData = {
        id: Date.now(),
        type: 'fingerprint',
        enrolledAt: new Date().toISOString(),
        status: 'active'
      };
      
      dispatch({ type: 'SET_BIOMETRIC_DATA', payload: biometricData });
      dispatch({ type: 'SET_ENABLED', payload: true });
      
      return biometricData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const disableBiometrics = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      dispatch({ type: 'SET_BIOMETRIC_DATA', payload: null });
      dispatch({ type: 'SET_ENABLED', payload: false });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const authenticateBiometric = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = Math.random() > 0.1; // 90% success rate
      
      if (!success) {
        throw new Error('Biometric authentication failed');
      }
      
      return { success: true, timestamp: new Date().toISOString() };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getBiometricStatus = async () => {
    try {
      // Simulate API call to get biometric status
      const status = {
        isEnabled: state.isEnabled,
        lastUsed: state.biometricData?.enrolledAt || null,
        deviceType: 'fingerprint'
      };
      
      return status;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const value = {
    ...state,
    checkBiometricSupport,
    enableBiometrics,
    disableBiometrics,
    authenticateBiometric,
    getBiometricStatus
  };

  return (
    <BiometricsContext.Provider value={value}>
      {children}
    </BiometricsContext.Provider>
  );
};

export const useBiometrics = () => {
  const context = useContext(BiometricsContext);
  if (!context) {
    throw new Error('useBiometrics must be used within a BiometricsProvider');
  }
  return context;
}; 