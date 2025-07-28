// src/pages/Home.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Home.css';
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

function Home() {
  const [taskInput, setTaskInput] = useState('');
  const [editText, setEditText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const {showNotification } = useNotification();
  const { darkMode, toggleMode } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();
  const { tasks, addTask, deleteTask, toggleComplete, editTask, startEdit, moveTaskUp, moveTaskDown, loading, error } = useTasks();
  const navigate = useNavigate();

  const handleAddTask = async () => {
    if (taskInput.trim() === '') return;
    await addTask(taskInput);
    setTaskInput('');
  };

  const handleSaveEdit = async (taskId) => {
    if (editText.trim() === '') return;
    await editTask(taskId, editText);
    setEditingTaskId(null);
    setEditText('');
  };

  const cancelEdit = (taskId) => {
    setEditingTaskId(null);
    setEditText('');
    editTask(taskId, tasks.find(t => t.id === taskId).text);
  };

  const visibleTasks = tasks.filter(task => !task.completed);

  return (
    <div className="home">
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

      <div className="input-box">
        <input
          type="text"
          className="task-input"
          placeholder={isLoggedIn ? "Add a new task" : "Please login to add tasks"}
          value={taskInput}
          maxLength={50}
          onChange={e => setTaskInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTask()}
          disabled={!isLoggedIn || loading}
        />
        <button className="box-button" onClick={handleAddTask} disabled={!isLoggedIn || loading}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {visibleTasks.length === 0 ? (
        <p className="no-tasks">No tasks yet.</p>
      ) : (
        <div className="task-list">
          {!isLoggedIn ? (
            <div className="login-prompt">
              <p>Please <button className="link-button" onClick={() => navigate('/login')}>login</button> to view your tasks.</p>
            </div>
          ) : loading ? (
            <div className="loading-message">Loading tasks...</div>
          ) : visibleTasks.length === 0 ? (
            <div className="no-tasks">No tasks yet. Add one above!</div>
          ) : (
            visibleTasks.map((task, index) => (
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
                    <img src={editIcon} alt="Edit Task" className="icon" />
                  </button>
                )}

                <button className="delete-button" onClick={() => deleteTask(task.id)}>
                  <img src={deleteIcon} alt="Delete Task" className="icon" />
                </button>

                <button
                  className="move-button"
                  onClick={() => moveTaskUp(task.id)}
                  disabled={index === 0}
                >
                  <img src={arrowUp} alt="Move Up" className="icon" />
                </button>

                <button
                  className="move-button"
                  onClick={() => moveTaskDown(task.id)}
                  disabled={index === visibleTasks.length - 1}
                >
                  <img src={arrowDown} alt="Move Down" className="icon" />
                </button>
              </div>
            </div>
          ))
          )}
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

export default Home;
