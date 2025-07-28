import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check for existing token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(username, password);
      const authToken = response.token;
      
      // Store auth data
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify({ username }));
      
      setToken(authToken);
      setUser({ username });
      setIsLoggedIn(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password) => {
    setLoading(true);
    try {
      const response = await authAPI.register(username, password);
      const authToken = response.token;
      
      // Store auth data
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify({ username }));
      
      setToken(authToken);
      setUser({ username });
      setIsLoggedIn(true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const refreshToken = async () => {
    if (!token) return { success: false, error: 'No token to refresh' };
    
    try {
      const response = await authAPI.refreshToken(token);
      const newToken = response.token;
      
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout(); // Clear invalid token
      return { success: false, error: error.message };
    }
  };

  // Legacy support for existing components
  const toggleAuth = () => {
    if (isLoggedIn) {
      logout();
    } else {
      // For backward compatibility, you might want to handle this differently
      console.warn('toggleAuth called when not logged in - use login() instead');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      token, 
      loading,
      login, 
      register, 
      logout, 
      refreshToken,
      toggleAuth // Keep for backward compatibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};
