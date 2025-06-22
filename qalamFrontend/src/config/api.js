// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  GITHUB_AUTH: `${API_BASE_URL}/auth/github`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  
  // GraphQL endpoint
  GRAPHQL: `${API_BASE_URL}/graphql`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
  
  // Posts
  POSTS: `${API_BASE_URL}/posts`,
  MY_POSTS: `${API_BASE_URL}/posts/my-posts`,
  POST_LIKE: (postId) => `${API_BASE_URL}/posts/${postId}/like`,
  POST_LIKE_STATUS: (postId) => `${API_BASE_URL}/posts/${postId}/like-status`,
  POST_COMMENTS: (postId) => `${API_BASE_URL}/posts/${postId}/comments`,
  POST_COMMENT: (postId, commentId) => `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
  USER_POSTS: (userId) => `${API_BASE_URL}/posts/${userId}/posts`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_PROFILE: (username) => `${API_BASE_URL}/users/profile/${username}`,
  USER_FRIENDS: (username) => `${API_BASE_URL}/users/profile/${username}/friends`,
  PROFILE_PICTURE_URL: `${API_BASE_URL}/profile-picture-url`,
  
  // Upload
  UPLOAD_DIRECT: `${API_BASE_URL}/upload/direct`,
  UPLOAD_PRESIGNED: `${API_BASE_URL}/upload/presigned-url`,
  UPLOAD_SIGNUP: `${API_BASE_URL}/upload/signup`,
  
  // S3
  S3_URL: (key) => `${API_BASE_URL}/signed-url/${key}`,
};

export default API_BASE_URL; 