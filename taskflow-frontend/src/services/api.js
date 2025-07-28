// API Configuration and Service Functions for Taskflow Backend

// Base URLs for different environments
const API_CONFIG = {
  LOCAL: 'http://localhost:8081',
  PRODUCTION: 'http://localhost:8080',
  // Current environment (change this for testing)
  CURRENT: 'http://localhost:8081'
};

// Get the current base URL
const getBaseUrl = () => API_CONFIG.CURRENT;

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` })
});

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  // Handle different response types
  if (response.status === 204) {
    return null; // No content
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${getBaseUrl()}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
};

// ========================================
// 🔐 AUTHENTICATION ENDPOINTS
// ========================================

export const authAPI = {
  /**
   * Register a new user
   * @param {string} username - Username (must be unique)
   * @param {string} password - Password (min 8 chars, letters + numbers)
   * @returns {Promise<{token: string}>}
   */
  register: async (username, password) => {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, password })
    });
  },

  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<{token: string}>}
   */
  login: async (username, password) => {
    return await apiRequest('/api/auth/login', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, password })
    });
  },

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {Promise<{token: string}>}
   */
  refreshToken: async (token) => {
    return await apiRequest('/api/auth/refresh', {
      method: 'POST',
      headers: getAuthHeaders(token)
    });
  }
};

// ========================================
// 📝 TODO ENDPOINTS
// ========================================

export const todoAPI = {
  /**
   * Create a new todo
   * @param {string} title - Todo title (required, max 100 chars)
   * @param {string} description - Todo description (optional, max 1000 chars)
   * @param {string} token - JWT token
   * @returns {Promise<Todo>}
   */
  create: async (title, description = '', token) => {
    return await apiRequest('/api/todos', {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ title, description })
    });
  },

  /**
   * Get all todos for the authenticated user
   * @param {string} token - JWT token
   * @returns {Promise<Todo[]>}
   */
  getAll: async (token) => {
    return await apiRequest('/api/todos', {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
  },

  /**
   * Get todo by ID
   * @param {string} id - Todo ID
   * @param {string} token - JWT token
   * @returns {Promise<Todo>}
   */
  getById: async (id, token) => {
    return await apiRequest(`/api/todos/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
  },

  /**
   * Delete todo by ID
   * @param {string} id - Todo ID
   * @param {string} token - JWT token
   * @returns {Promise<null>}
   */
  delete: async (id, token) => {
    return await apiRequest(`/api/todos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
  }
};

// ========================================
// 🏥 HEALTH CHECK ENDPOINTS
// ========================================

export const healthAPI = {
  /**
   * Basic ping endpoint
   * @returns {Promise<{status: string, message: string, timestamp: string}>}
   */
  ping: async () => {
    return await apiRequest('/api/health/ping');
  },

  /**
   * Database health check
   * @returns {Promise<{status: string, database: string, version: string, url: string, connection: string}>}
   */
  database: async () => {
    return await apiRequest('/api/health/database');
  },

  /**
   * System status check
   * @returns {Promise<{status: string, application: string, timestamp: number, database_connected: boolean}>}
   */
  status: async () => {
    return await apiRequest('/api/health/status');
  },

  /**
   * Spring Actuator health check
   * @returns {Promise<{status: string, components: object}>}
   */
  actuator: async () => {
    return await apiRequest('/actuator/health');
  }
};

// ========================================
// 🛠️ UTILITY FUNCTIONS
// ========================================

/**
 * Set the current environment for API calls
 * @param {'LOCAL'|'PRODUCTION'|string} environment - Environment or custom URL
 */
export const setEnvironment = (environment) => {
  if (API_CONFIG[environment]) {
    API_CONFIG.CURRENT = API_CONFIG[environment];
  } else if (typeof environment === 'string') {
    API_CONFIG.CURRENT = environment;
  }
};

/**
 * Get current API base URL
 * @returns {string}
 */
export const getCurrentApiUrl = () => API_CONFIG.CURRENT;

/**
 * Check if API is reachable
 * @returns {Promise<boolean>}
 */
export const checkApiHealth = async () => {
  try {
    await healthAPI.ping();
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// ========================================
// 📊 EXAMPLE USAGE
// ========================================

/*
// Example usage in your components:

// 1. Register a user
try {
  const { token } = await authAPI.register('john', 'password123');
  localStorage.setItem('authToken', token);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// 2. Login
try {
  const { token } = await authAPI.login('john', 'password123');
  localStorage.setItem('authToken', token);
} catch (error) {
  console.error('Login failed:', error.message);
}

// 3. Create a todo
try {
  const token = localStorage.getItem('authToken');
  const todo = await todoAPI.create('My First Todo', 'Learn the API', token);
  console.log('Created todo:', todo);
} catch (error) {
  console.error('Failed to create todo:', error.message);
}

// 4. Get all todos
try {
  const token = localStorage.getItem('authToken');
  const todos = await todoAPI.getAll(token);
  console.log('All todos:', todos);
} catch (error) {
  console.error('Failed to fetch todos:', error.message);
}

// 5. Check API health
const isHealthy = await checkApiHealth();
console.log('API is healthy:', isHealthy);

// 6. Switch environment
setEnvironment('PRODUCTION'); // or 'LOCAL' or custom URL
*/

export default {
  auth: authAPI,
  todo: todoAPI,
  health: healthAPI,
  setEnvironment,
  getCurrentApiUrl,
  checkApiHealth
}; 