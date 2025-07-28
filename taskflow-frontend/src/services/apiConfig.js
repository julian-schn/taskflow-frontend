// API Configuration for different environments

export const API_ENVIRONMENTS = {
  LOCAL: 'http://localhost:8081',
  DOCKER: 'http://localhost:8081', // Same as local for Docker setup
  PRODUCTION: 'http://localhost:8080',
  DEVELOPMENT: 'http://localhost:8081'
};

// Default environment (change this for testing)
export const DEFAULT_ENVIRONMENT = 'LOCAL';

// Rate limiting information for reference
export const RATE_LIMITS = {
  AUTH_ENDPOINTS: '5 requests per minute per IP',
  TOKEN_REFRESH: '10 requests per minute per IP',
  OTHER_ENDPOINTS: 'No rate limiting'
};

// Authentication requirements
export const AUTH_REQUIREMENTS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: 'Must contain letters and numbers',
  USERNAME_REQUIREMENTS: 'Must be unique',
  TOKEN_EXPIRY: '24 hours'
};

// Field validation limits
export const VALIDATION_LIMITS = {
  TODO_TITLE_MAX: 100,
  TODO_DESCRIPTION_MAX: 1000
};

export default {
  API_ENVIRONMENTS,
  DEFAULT_ENVIRONMENT,
  RATE_LIMITS,
  AUTH_REQUIREMENTS,
  VALIDATION_LIMITS
}; 