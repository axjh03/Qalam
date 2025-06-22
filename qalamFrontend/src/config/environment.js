// Environment configuration
export const config = {
  // Production backend URL
  API_URL: 'https://qalam.onrender.com',
  
  // Development backend URL (fallback)
  DEV_API_URL: 'http://localhost:3000',
  
  // Get the appropriate URL based on environment
  getBackendUrl: () => {
    // In production (Netlify), use the deployed backend
    if (import.meta.env.PROD) {
      return config.API_URL;
    }
    
    // In development, use environment variable or fallback to localhost
    return import.meta.env.VITE_API_URL || config.DEV_API_URL;
  }
}; 