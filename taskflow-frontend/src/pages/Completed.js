// src/pages/Completed.js
import React, { useState, useRef, useEffect } from 'react';
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

  // Titel-Editing wie in Home
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const titleInputRef = useRef(null);

  const { showNotification } = useNotification();
  const { darkMode, toggleMode } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();
  const { tasks, toggleComplete, loading, error, editTask } = useTasks();
  const navigate = useNavigate();

  const completedTasks = tasks.filter((task) => task.completed);

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setIsEditingTitle(false);
    setDraftTitle(task?.text ?? '');
  };
  const closeTaskModal = () => {
    setIsEditingTitle(false);
    setSelectedTask(null);
  };

  const handleUncompleteWithFade = (id) => {
    if (leavingId) return;
    setLeavingId(id);
    setTimeout(() => {
      toggleComplete(id);
      setLeavingId(null);
    }, 220);
  };

  // Edit Title – gleich wie in Home
  useEffect(() => {
    if (isEditingTitle) {
      setTimeout(() => titleInputRef.current?.select(), 0);
    }
  }, [isEditingTitle]);

  // selectedTask mit globalem State synchron halten
  useEffect(() => {
    if (selectedTask) {
      const latest = tasks.find((t) => t.id === selectedTask.id);
      if (latest && latest !== selectedTask) setSelectedTask(latest);
    }
  }, [tasks, selectedTask]);

  const commitTitle = async () => {
    const next = (draftTitle ?? '').trim();
    const current = selectedTask?.text ?? '';
    setIsEditingTitle(false);

    if (!selectedTask) return;
    if (!next || next === current) {
      setDraftTitle(current);
      return;
    }
    if (next.length > 100) {
      setDraftTitle(next.slice(0, 100));
      showNotification?.('Title truncated (max 100 characters)');
    }

    await editTask(selectedTask.id, next.slice(0, 100));
    setSelectedTask((prev) => (prev ? { ...prev, text: next.slice(0, 100) } : prev));
    showNotification?.('Title updated');
  };

  const cancelEdit = () => {
    setDraftTitle(selectedTask?.text ?? '');
    setIsEditingTitle(false);
  };

  // Timestamp-Format – gleich wie in Home
  const formatCompletedAt = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (sameDay) return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;
    const date = d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    return `${date}, ${time}`;
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
            className={({ isActive }) => `filter-button ${isActive ? 'active' : ''}`}
          >
            All
          </NavLink>
          <NavLink
            to="/completed"
            className={({ isActive }) => `filter-button ${isActive ? 'active' : ''}`}
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

      {/* === Task Details Panel (gleich wie Home) === */}
      <TaskModal isOpen={!!selectedTask} onClose={closeTaskModal}>
        <div className="task-details">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Task Details</h2>

          {/* Title als Überschrift */}
          <div className="title-block">
            <div className="section-label">Title</div>

            {isEditingTitle ? (
              <input
                id="task-title-input"
                ref={titleInputRef}
                className="task-title-input"
                value={draftTitle}
                maxLength={100}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTitle();
                  if (e.key === 'Escape') cancelEdit();
                }}
                aria-label="Edit title"
                autoFocus
              />
            ) : (
              <button
                className="task-title-button"
                title="Edit title"
                onClick={(e) => {
                  e.stopPropagation?.();
                  setDraftTitle(selectedTask?.text ?? '');
                  setIsEditingTitle(true);
                }}
                aria-label="Edit title"
              >
                {selectedTask?.text}
              </button>
            )}
          </div>

          {/* Status-Block */}
          <div className="status-block">
            <div className="section-label">Status</div>

            <label htmlFor="modal-done" className="status-toggle">
              <input
                id="modal-done"
                type="checkbox"
                className="task-checkbox modal-checkbox"
                checked={!!selectedTask?.completed}
                onClick={(e) => e.stopPropagation()}
                onChange={() => {
                  if (!selectedTask) return;
                  toggleComplete(selectedTask.id);
                  setSelectedTask((prev) =>
                    prev
                      ? {
                          ...prev,
                          completed: !prev.completed,
                          completedAt: !prev.completed ? new Date().toISOString() : null,
                        }
                      : prev
                  );
                }}
                aria-label={selectedTask?.completed ? 'Mark as open' : 'Mark as done'}
              />

              <div className="status-copy">
                <span className="status-text">
                  {selectedTask?.completed ? 'Completed' : 'Mark as done'}
                </span>

                {selectedTask?.completed && (
                  <div className="completed-meta">
                    Completed • {formatCompletedAt(selectedTask?.completedAt)}
                  </div>
                )}
              </div>
            </label>
          </div>

          <p style={{ opacity: 0.7, marginTop: 12 }}>
            <em>(Notes, due date, priority coming soon…)</em>
          </p>
        </div>
      </TaskModal>
    </div>
  );
}

export default Completed;
