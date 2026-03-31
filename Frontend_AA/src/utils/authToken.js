/**
 * utils/authToken.js
 * Utility functions for managing JWT authentication tokens
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Get token from sessionStorage
 */
export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Set token in sessionStorage
 */
export const setToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

/**
 * Remove token from sessionStorage
 */
export const clearToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing token:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get user data from sessionStorage
 */
export const getUserData = () => {
  try {
    const userData = sessionStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Set user data in sessionStorage
 */
export const setUserData = (userData) => {
  try {
    if (userData) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

/**
 * Get authorization header
 */
export const getAuthHeader = () => {
  const token = getToken();
  if (!token) {
    return null;
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Parse JWT token and extract payload (without verification - frontend only)
 * Use this only for getting user info from token
 */
export const parseToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};
