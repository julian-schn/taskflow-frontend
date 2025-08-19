import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Home.css';
import { ReactComponent as LightIcon } from '../assets/light_mode.svg';
import { ReactComponent as DarkIcon } from '../assets/dark_mode.svg';
import { ReactComponent as LoginIcon } from '../assets/loginIconsvg.svg';
import { ReactComponent as LogoutIcon } from '../assets/logoutIcon.svg';
import { useTasks } from '../context/TaskContext';
import { useTheme } from './ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import TaskModal from '../components/TaskModal';
import { ReactComponent as InfoIcon } from '../assets/info.svg';

function Home() {
  const [taskInput, setTaskInput] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [leavingId, setLeavingId] = useState(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const titleInputRef = useRef(null);

  const { showNotification } = useNotification();
  const { darkMode, toggleMode } = useTheme();
  const { isLoggedIn, user, logout } = useAuth();

  const {
    tasks,
    addTask,
    toggleComplete,
    loading,
    error,
    editTask, 
  } = useTasks();

  const navigate = useNavigate();

  const handleAddTask = async () => {
    if (taskInput.trim() === '') return;
    await addTask(taskInput);
    setTaskInput('');
  };

  const visibleTasks = tasks.filter((task) => !task.completed);

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setIsEditingTitle(false);
    setDraftTitle(task?.text ?? '');
  };

  const closeTaskModal = () => {
    setIsEditingTitle(false);
    setSelectedTask(null);
  };

  const handleCompleteWithFade = (id) => {
    if (leavingId) return;
    setLeavingId(id);
    setTimeout(() => {
      toggleComplete(id);
      setLeavingId(null);
    }, 220);
  };

  useEffect(() => {
    if (isEditingTitle) {
      setTimeout(() => titleInputRef.current?.select(), 0);
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (!isEditingTitle && selectedTask) {
      const latest = tasks.find((t) => t.id === selectedTask.id);
      if (latest && latest !== selectedTask) setSelectedTask(latest);
    }
  }, [tasks, isEditingTitle, selectedTask]);

  const startEditTitle = (e) => {
    e?.stopPropagation?.();
    setDraftTitle(selectedTask?.text ?? '');
    setIsEditingTitle(true);
  };

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

  return (
    <div className="home">
      <h1>taskflow.</h1>

      {isLoggedIn && user && (
        <div className="user-info">Welcome back, {user.username}!</div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <div className="input-box">
        <input
          type="text"
          className="task-input"
          placeholder={isLoggedIn ? 'Add a new task' : 'Please login to add tasks'}
          value={taskInput}
          maxLength={50}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          disabled={!isLoggedIn || loading}
        />
        <button
          className="box-button"
          onClick={handleAddTask}
          disabled={!isLoggedIn || loading}
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {visibleTasks.length === 0 ? (
        <p className="no-tasks">No tasks yet.</p>
      ) : (
        <div className="task-list">
          {!isLoggedIn ? (
            <div className="login-prompt">
              <p>
                Please{' '}
                <button className="link-button" onClick={() => navigate('/login')}>
                  login
                </button>{' '}
                to view your tasks.
              </p>
            </div>
          ) : loading ? (
            <div className="loading-message">Loading tasks...</div>
          ) : (
            visibleTasks.map((task) => (
              <div
                key={task.id}
                className={`task-box task-row-clickable ${
                  leavingId === task.id ? 'leaving' : ''
                }`}
                onClick={() => openTaskModal(task)}
              >
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.completed}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleCompleteWithFade(task.id);
                    }
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
            {isLoggedIn ? (
              <LogoutIcon className="auth-icon" />
            ) : (
              <LoginIcon className="auth-icon" />
            )}
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
            {darkMode ? (
              <LightIcon className="mode-icon" />
            ) : (
              <DarkIcon className="mode-icon" />
            )}
          </button>
        </div>
      </div>

<TaskModal isOpen={!!selectedTask} onClose={closeTaskModal}>
  <div className="task-details">
    <h2 style={{ marginTop: 0, marginBottom: 8 }}>Task Details</h2>

    <div className="field field-inline">
      <label className="field-inline-label" htmlFor="task-title-input">Title:</label>

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
          onClick={startEditTitle}
          aria-label="Edit title"
        >
          {selectedTask?.text}
        </button>
      )}
    </div>

    <p style={{ opacity: 0.7, marginTop: 12 }}>
      <em>(Notes, due date, priority coming soon…)</em>
    </p>
  </div>
</TaskModal>
    </div>
  );
}

export default Home;