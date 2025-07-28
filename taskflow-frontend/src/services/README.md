# API Services Documentation

This directory contains all the API service files for connecting to the Taskflow Backend API during local testing and development.

## Files Overview

### 📁 `api.js`
Main API service file containing all endpoint functions organized by category:
- **Authentication**: `authAPI` - register, login, refresh token
- **Todos**: `todoAPI` - create, get all, get by ID, delete
- **Health**: `healthAPI` - ping, database, status, actuator
- **Utilities**: environment switching, health checking

### 📁 `apiConfig.js`
Configuration file with:
- Environment URLs (Local: `http://localhost:8081`, Production: `http://localhost:8080`)
- Rate limits and validation rules
- Authentication requirements

### 📁 `apiTest.js`
Testing utility to verify API endpoints are working:
- Connection testing
- Health endpoint verification
- Authentication flow testing
- Todo operations testing

## Quick Start

### 1. Test API Connection
First, make sure your backend is running on `http://localhost:8081`, then test the connection:

```javascript
// In browser console or component
import { quickTests } from './services/apiTest.js';

// Test if API is reachable
await quickTests.health();
```

### 2. Run All Tests
```javascript
import { quickTests } from './services/apiTest.js';

// Run comprehensive tests
await quickTests.all();
```

### 3. Switch Environments
```javascript
import { switchEnvironment } from './services/apiTest.js';

// Switch to production
switchEnvironment('PRODUCTION'); // http://localhost:8080

// Switch back to local
switchEnvironment('LOCAL'); // http://localhost:8081
```

## Using the API in Your Components

### Authentication Example
```javascript
import { authAPI } from './services/api.js';

// Register a new user
try {
  const { token } = await authAPI.register('username', 'password123');
  localStorage.setItem('authToken', token);
  console.log('Registration successful!');
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Login
try {
  const { token } = await authAPI.login('username', 'password123');
  localStorage.setItem('authToken', token);
  console.log('Login successful!');
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Todo Operations Example
```javascript
import { todoAPI } from './services/api.js';

const token = localStorage.getItem('authToken');

// Create a todo
try {
  const todo = await todoAPI.create('Buy groceries', 'Milk, bread, eggs', token);
  console.log('Todo created:', todo);
} catch (error) {
  console.error('Failed to create todo:', error.message);
}

// Get all todos
try {
  const todos = await todoAPI.getAll(token);
  console.log('All todos:', todos);
} catch (error) {
  console.error('Failed to fetch todos:', error.message);
}

// Delete a todo
try {
  await todoAPI.delete(todoId, token);
  console.log('Todo deleted successfully');
} catch (error) {
  console.error('Failed to delete todo:', error.message);
}
```

## Integration with Existing Contexts

To integrate these API services with your existing React contexts:

### Update AuthContext
```javascript
// In AuthContext.js
import { authAPI } from '../services/api.js';

// Replace toggleAuth with actual login/logout
const login = async (username, password) => {
  try {
    const { token } = await authAPI.login(username, password);
    localStorage.setItem('authToken', token);
    setIsLoggedIn(true);
    setUser({ username });
  } catch (error) {
    throw error;
  }
};
```

### Update TaskContext
```javascript
// In TaskContext.js
import { todoAPI } from '../services/api.js';

// Replace local state operations with API calls
const addTask = async (title, description = '') => {
  try {
    const token = localStorage.getItem('authToken');
    const todo = await todoAPI.create(title, description, token);
    setTasks(prev => [...prev, todo]);
  } catch (error) {
    console.error('Failed to add task:', error);
  }
};
```

## Error Handling

The API service includes comprehensive error handling:

- **Network errors**: Connection failures, timeouts
- **HTTP errors**: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 429 (rate limit)
- **Response parsing**: JSON/text response handling

## Environment Configuration

### Available Environments
- `LOCAL`: `http://localhost:8081` (default for development)
- `PRODUCTION`: `http://localhost:8080`
- `DOCKER`: `http://localhost:8081` (same as local)

### Switching Environments
```javascript
import { setEnvironment } from './services/api.js';

// Method 1: Use predefined environments
setEnvironment('PRODUCTION');

// Method 2: Use custom URL
setEnvironment('http://my-custom-backend:3000');
```

## Testing Your Backend

1. **Start your backend** on `http://localhost:8081`
2. **Open browser console** in your React app
3. **Run tests**:
   ```javascript
   import { quickTests } from './services/apiTest.js';
   await quickTests.all();
   ```

## Notes

- All todo endpoints require JWT authentication
- Tokens expire after 24 hours
- Rate limits apply to auth endpoints (5 req/min)
- H2 console available at `http://localhost:8081/h2-console` in development

## Next Steps

1. Test the API connection with your backend
2. Integrate the API services with your existing React contexts
3. Replace local state management with actual API calls
4. Add proper error handling and loading states to your UI components

For more details, check the example usage comments in each service file. 