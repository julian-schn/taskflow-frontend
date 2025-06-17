import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './pages/theme.css';
import Home from './pages/Home';
import Completed from './pages/Completed';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { ThemeProvider } from './pages/ThemeContext';
import { AuthProvider } from './pages/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { TaskProvider } from './context/TaskContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <TaskProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/completed" element={<Completed />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                </Routes>
              </div>
            </Router>
          </TaskProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
