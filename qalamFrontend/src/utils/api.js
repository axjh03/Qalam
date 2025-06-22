// Utility function to get the backend URL
export const getBackendUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add Authorization header if token exists
  const token = localStorage.getItem('jwt_token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  return response;
}; 