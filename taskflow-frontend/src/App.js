
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './pages/theme.css';
import Home from './pages/Home';
import Completed from './pages/Completed';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './pages/ThemeContext';
import { AuthProvider } from './pages/AuthContext';
import LoginPage from './pages/LoginPage';
import { NotificationProvider } from './context/NotificationContext';

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
