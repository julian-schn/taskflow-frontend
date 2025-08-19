
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Completed.css';
import lightIcon from '../assets/light_mode.svg';
import darkIcon from '../assets/dark_mode.svg';
import loginIcon from '../assets/loginIconsvg.svg';
import logoutIcon from '../assets/logoutIcon.svg';
import { useTasks } from '../context/TaskContext';
import { useTheme } from './ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import TaskModal from '../components/TaskModal';
import { ReactComponent as InfoIcon } from '../assets/info.svg';

function Completed() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [leavingId, setLeavingId] = useState(null);

  const { showNotification } = useNotification();
  const { darkMode, toggleMode } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();
  const { tasks, toggleComplete, loading, error } = useTasks();
  const navigate = useNavigate();

  const completedTasks = tasks.filter((task) => task.completed);

  const openTaskModal = (task) => setSelectedTask(task);
  const closeTaskModal = () => setSelectedTask(null);

  const handleUncompleteWithFade = (id) => {
    if (leavingId) return;
    setLeavingId(id);                 // startet CSS-Animation
    setTimeout(() => {
      toggleComplete(id);             // danach entfernt der Filter das Item
      setLeavingId(null);
    }, 220);
  };

  return (
    <div className="completed">
      <h1>taskflow.</h1>

      {isLoggedIn && user && (
        <div className="user-info">Welcome back, {user.username}!</div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <h2>Completed Tasks:</h2>

      {!isLoggedIn ? (
        <div className="login-prompt">
          <p>
            Please{' '}
            <button className="link-button" onClick={() => navigate('/login')}>
              login
            </button>{' '}
            to view your completed tasks.
          </p>
        </div>
      ) : loading ? (
        <div className="loading-message">Loading tasks...</div>
      ) : completedTasks.length === 0 ? (
        <p className="no-tasks">No completed tasks yet.</p>
      ) : (
        <div className="task-list">
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className={`task-box task-row-clickable ${leavingId === task.id ? 'leaving' : ''}`}
              onClick={() => openTaskModal(task)}
            >
              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.completed}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (!e.target.checked) handleUncompleteWithFade(task.id);
                }}
              />

              <span className="task-text">{task.text}</span>

              <button
                className="info-button"
                title="Details"
                onClick={(e) => {
                  e.stopPropagation();
                  openTaskModal(task);
                }}
                aria-label="Task-Details öffnen"
              >
                <InfoIcon className="info-icon" />
              </button>
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
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `filter-button ${isActive ? 'active' : ''}`
            }
          >
            All
          </NavLink>
          <NavLink
            to="/completed"
            className={({ isActive }) =>
              `filter-button ${isActive ? 'active' : ''}`
            }
          >
            Completed
          </NavLink>
        </div>

        <div className="mode-buttons">
          <button className="mode" onClick={toggleMode}>
            <img
              src={darkMode ? lightIcon : darkIcon}
              alt="Toggle Dark"
              className="mode-icon"
            />
          </button>
        </div>
      </div>

      <TaskModal isOpen={!!selectedTask} onClose={closeTaskModal}>
        <h2 style={{ marginTop: 0 }}>Task Details</h2>
        <p>
          <strong>Title:</strong> {selectedTask?.text}
        </p>
        <p>
          <em>(Hier später Notizen, Due Date, Priority …)</em>
        </p>
      </TaskModal>
    </div>
  );
}

export default Completed;