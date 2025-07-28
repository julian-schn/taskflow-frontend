// API Testing Utility
// Use this file to test your API endpoints during development

import { authAPI, todoAPI, healthAPI, setEnvironment, getCurrentApiUrl } from './api.js';

// Test utilities
export const apiTester = {
  // Test if API is reachable
  async testConnection() {
    console.log('🔗 Testing API connection...');
    console.log('Current API URL:', getCurrentApiUrl());
    
    try {
      const response = await healthAPI.ping();
      console.log('✅ API is reachable:', response);
      return true;
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      return false;
    }
  },

  // Test all health endpoints
  async testHealthEndpoints() {
    console.log('🏥 Testing health endpoints...');
    
    const tests = [
      { name: 'Ping', test: () => healthAPI.ping() },
      { name: 'Database', test: () => healthAPI.database() },
      { name: 'Status', test: () => healthAPI.status() },
      { name: 'Actuator', test: () => healthAPI.actuator() }
    ];

    for (const { name, test } of tests) {
      try {
        const result = await test();
        console.log(`✅ ${name}:`, result);
      } catch (error) {
        console.error(`❌ ${name} failed:`, error.message);
      }
    }
  },

  // Test authentication flow
  async testAuthFlow(testUsername = 'testuser', testPassword = 'testpass123') {
    console.log('🔐 Testing authentication flow...');
    
    try {
      // Test registration
      console.log('📝 Testing registration...');
      const registerResult = await authAPI.register(testUsername, testPassword);
      console.log('✅ Registration successful:', registerResult);
      
      // Test login
      console.log('🔑 Testing login...');
      const loginResult = await authAPI.login(testUsername, testPassword);
      console.log('✅ Login successful:', loginResult);
      
      // Test token refresh
      console.log('🔄 Testing token refresh...');
      const refreshResult = await authAPI.refreshToken(loginResult.token);
      console.log('✅ Token refresh successful:', refreshResult);
      
      return loginResult.token;
      
    } catch (error) {
      console.error('❌ Auth flow failed:', error.message);
      
      // If registration failed (user might already exist), try login only
      if (error.message.includes('409') || error.message.includes('already exists')) {
        console.log('⚠️ User might already exist, trying login only...');
        try {
          const loginResult = await authAPI.login(testUsername, testPassword);
          console.log('✅ Login successful:', loginResult);
          return loginResult.token;
        } catch (loginError) {
          console.error('❌ Login also failed:', loginError.message);
          return null;
        }
      }
      return null;
    }
  },

  // Test todo operations
  async testTodoOperations(token) {
    if (!token) {
      console.error('❌ No token provided for todo tests');
      return;
    }

    console.log('📝 Testing todo operations...');
    
    try {
      // Create a todo
      console.log('➕ Creating a todo...');
      const createResult = await todoAPI.create('Test Todo', 'This is a test todo', token);
      console.log('✅ Todo created:', createResult);
      
      // Get all todos
      console.log('📋 Getting all todos...');
      const allTodos = await todoAPI.getAll(token);
      console.log('✅ All todos:', allTodos);
      
      // Get todo by ID
      if (createResult && createResult.id) {
        console.log('🔍 Getting todo by ID...');
        const todoById = await todoAPI.getById(createResult.id, token);
        console.log('✅ Todo by ID:', todoById);
        
        // Delete the todo
        console.log('🗑️ Deleting todo...');
        await todoAPI.delete(createResult.id, token);
        console.log('✅ Todo deleted successfully');
      }
      
    } catch (error) {
      console.error('❌ Todo operations failed:', error.message);
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting comprehensive API tests...');
    console.log('=' .repeat(50));
    
    // Test connection
    const connected = await this.testConnection();
    if (!connected) {
      console.log('❌ Skipping further tests due to connection failure');
      return;
    }
    
    console.log('\n');
    
    // Test health endpoints
    await this.testHealthEndpoints();
    console.log('\n');
    
    // Test auth flow
    const token = await this.testAuthFlow();
    console.log('\n');
    
    // Test todo operations if we have a token
    if (token) {
      await this.testTodoOperations(token);
    }
    
    console.log('\n');
    console.log('🏁 Tests completed!');
    console.log('=' .repeat(50));
  }
};

// Quick test functions for console usage
export const quickTests = {
  // Quick health check
  health: () => apiTester.testConnection(),
  
  // Quick auth test
  auth: (username, password) => apiTester.testAuthFlow(username, password),
  
  // Quick todo test (requires token)
  todos: (token) => apiTester.testTodoOperations(token),
  
  // Run everything
  all: () => apiTester.runAllTests()
};

// Environment switching helper
export const switchEnvironment = (env) => {
  setEnvironment(env);
  console.log(`🔄 Switched to ${env} environment: ${getCurrentApiUrl()}`);
};

// Usage examples in console:
/*
// Import in console or component:
import { apiTester, quickTests, switchEnvironment } from './services/apiTest.js';

// Quick tests:
quickTests.health();          // Test connection
quickTests.auth();            // Test auth with default credentials
quickTests.all();             // Run all tests

// Switch environments:
switchEnvironment('LOCAL');     // http://localhost:8081
switchEnvironment('PRODUCTION'); // http://localhost:8080

// Manual testing:
apiTester.testConnection();
apiTester.testHealthEndpoints();
apiTester.testAuthFlow('myuser', 'mypass123');
*/

export default apiTester; 