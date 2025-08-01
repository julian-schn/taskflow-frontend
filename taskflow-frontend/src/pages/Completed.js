// src/pages/Completed.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Completed.css';
import deleteIcon from '../assets/delete_icon.svg';
import editIcon from '../assets/edit_icon.svg';
import arrowUp from '../assets/arrow_upward.svg';
import arrowDown from '../assets/arrow_downward.svg';
import lightIcon from '../assets/light_mode.svg';
import darkIcon from '../assets/dark_mode.svg';
import loginIcon from '../assets/loginIconsvg.svg';
import logoutIcon from '../assets/logoutIcon.svg';
import { useTasks } from '../context/TaskContext';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useNotification } from '../context/NotificationContext';

function Completed() {
  const [editText, setEditText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const {showNotification } = useNotification();
  const { darkMode, toggleMode } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();
  const { tasks, toggleComplete, deleteTask, editTask, startEdit, moveTaskUp, moveTaskDown, loading, error } = useTasks();
  const navigate = useNavigate();

  const completedTasks = tasks.filter(task => task.completed);

  const handleSaveEdit = (taskId) => {
    if (editText.trim() === '') return;
    editTask(taskId, editText);
    setEditingTaskId(null);
    setEditText('');
  };

  const cancelEdit = (taskId) => {
    setEditingTaskId(null);
    setEditText('');
    editTask(taskId, tasks.find(t => t.id === taskId).text);
  };

  return (
    <div className="completed">
      <h1>taskflow.</h1>

      {/* Show user info if logged in */}
      {isLoggedIn && user && (
        <div className="user-info" style={{ marginBottom: '1rem', textAlign: 'center', color: '#666' }}>
          Welcome back, {user.username}!
        </div>
      )}

      {/* Show error if there's an API error */}
      {error && (
        <div className="error-banner" style={{ 
          marginBottom: '1rem', 
          padding: '0.5rem', 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #ffcccc', 
          borderRadius: '4px',
          color: '#d32f2f',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <h2>Completed Tasks:</h2>

      {!isLoggedIn ? (
        <div className="login-prompt" style={{ textAlign: 'center', margin: '2rem 0' }}>
          <p>Please <button className="link-button" onClick={() => navigate('/login')} style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            textDecoration: 'underline', 
            cursor: 'pointer' 
          }}>login</button> to view your completed tasks.</p>
        </div>
      ) : loading ? (
        <div className="loading-message" style={{ textAlign: 'center', margin: '2rem 0' }}>Loading tasks...</div>
      ) : completedTasks.length === 0 ? (
        <p className="no-tasks">No completed tasks yet.</p>
      ) : (
        <div className="task-list">
          {completedTasks.map((task, index) => (
            <div key={task.id} className="task-box">
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
              />

              {task.isEditing && editingTaskId === task.id ? (
                <input
                  className="task-input"
                  autoFocus
                  value={editText}
                  maxLength={50}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveEdit(task.id)}
                  onBlur={() => cancelEdit(task.id)}
                />
              ) : (
                <span>{task.text}</span>
              )}

              <div className="task-actions">
                {task.isEditing && editingTaskId === task.id ? (
                  <button className="save-button" onMouseDown={() => handleSaveEdit(task.id)}>
                    Save
                  </button>
                ) : (
                  <button
                    className="edit-button"
                    onClick={() => {
                      setEditText(task.text);
                      setEditingTaskId(task.id);
                      startEdit(task.id);
                    }}
                  >
                    <img src={editIcon} alt="Edit" className="icon" />
                  </button>
                )}

                <button className="delete-button" onClick={() => deleteTask(task.id)}>
                  <img src={deleteIcon} alt="Delete" className="icon" />
                </button>

                <button
                  className="move-button"
                  onClick={() => moveTaskUp(task.id)}
                  disabled={index === 0}
                >
                  <img src={arrowUp} alt="Up" className="icon" />
                </button>

                <button
                  className="move-button"
                  onClick={() => moveTaskDown(task.id)}
                  disabled={index === completedTasks.length - 1}
                >
                  <img src={arrowDown} alt="Down" className="icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="filter-container">
        <div className="auth-buttons">
          <button
            className="auth-button"
            onClick={() => {
              if (isLoggedIn) {
                logout();
                showNotification('Logout successful!');
              } else {
                navigate('/login'); 
              }
            }}
          >
            <img
              src={isLoggedIn ? logoutIcon : loginIcon}
              alt={isLoggedIn ? 'Logout' : 'Login'}
              className="auth-icon"
            />
          </button>
        </div>
        <div className="filter-buttons">
          <NavLink to="/" end className={({ isActive }) => `filter-button ${isActive ? 'active' : ''}`}>
            All
          </NavLink>
          <NavLink to="/completed" className={({ isActive }) => `filter-button ${isActive ? 'active' : ''}`}>
            Completed
          </NavLink>
        </div>
        <div className="mode-buttons">
          <button className="mode" onClick={toggleMode}>
            <img src={darkMode ? lightIcon : darkIcon} alt="Toggle Dark" className="mode-icon" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Completed;
