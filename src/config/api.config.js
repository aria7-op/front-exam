// API Configuration for external deployment
const API_CONFIG = {
  // Using external HTTPS endpoints for proper CORS
  baseURL: 'https://31.97.70.79:5050/api/v1',
  socketURL: 'https://31.97.70.79:5050',
  description: 'External Deployment - Using HTTPS endpoints for proper CORS handling'
};

// Export current configuration (always production for cPanel)
export const currentConfig = API_CONFIG;

// Export individual values for convenience
export const API_BASE_URL = currentConfig.baseURL;
export const SOCKET_URL = currentConfig.socketURL;

// Export full config for debugging
export const API_CONFIG_FULL = {
  current: currentConfig,
  all: API_CONFIG,
  environment: 'production'
};

// Helper function to get full URL
export const getFullURL = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get socket URL
export const getSocketURL = () => {
  return SOCKET_URL;
};

export default API_CONFIG; 