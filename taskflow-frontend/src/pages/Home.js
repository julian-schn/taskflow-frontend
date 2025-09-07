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
  const [dueDateStr, setDueDateStr] = useState('');
  const [dueTimeStr, setDueTimeStr] = useState('');
  const [notesStr, setNotesStr] = useState('');
  const notesDebounceRef = useRef(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
    setDueDate,
    setNote,
    deleteTask,
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
    const { dateStr, timeStr } = isoToLocalParts(task?.dueAt);
    setDueDateStr(dateStr);
    setDueTimeStr(timeStr);
    setNotesStr(task?.notes ?? '');
    setConfirmingDelete(false);
  };

  const closeTaskModal = () => {
    setIsEditingTitle(false);
    setSelectedTask(null);
    setNotesStr('');
    setConfirmingDelete(false);
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
    if (isEditingTitle) setTimeout(() => titleInputRef.current?.select(), 0);
  }, [isEditingTitle]);

  useEffect(() => {
    if (selectedTask) {
      const latest = tasks.find((t) => t.id === selectedTask.id);
      if (latest && latest !== selectedTask) setSelectedTask(latest);
      if (latest && latest.notes !== undefined) setNotesStr(latest.notes ?? '');
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
    await editTask(selectedTask.id, next.slice(0, 100));
    setSelectedTask((prev) => (prev ? { ...prev, text: next.slice(0, 100) } : prev));
    showNotification?.('Title updated');
  };

  const cancelEdit = () => {
    setDraftTitle(selectedTask?.text ?? '');
    setIsEditingTitle(false);
  };

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

  const pad = (n) => String(n).padStart(2, '0');
  const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const toHm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  function isoToLocalParts(iso) {
    if (!iso) return { dateStr: '', timeStr: '' };
    const d = new Date(iso);
    return { dateStr: toYmd(d), timeStr: toHm(d) };
  }

  function localPartsToIso(dateStr, timeStr) {
    if (!dateStr && !timeStr) return null;
    const now = new Date();
    const [y, m, d] = (dateStr || toYmd(now)).split('-').map(Number);
    const [hh, mm] = (timeStr || '17:00').split(':').map(Number);
    const local = new Date(y, (m || 1) - 1, d || 1, hh ?? 17, mm ?? 0, 0, 0);
    return local.toISOString();
  }

  function dueState(iso) {
    if (!iso) return null;
    const now = new Date();
    const d = new Date(iso);
    const diff = d - now;
    const sameDay = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (diff < 0) return 'overdue';
    if (sameDay) return 'today';
    if (d.toDateString() === tomorrow.toDateString()) return 'tomorrow';
    return 'future';
  }

  function humanizeDue(iso) {
    if (!iso) return '';
    const now = new Date();
    const d = new Date(iso);
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d < now) {
      const diffMs = now - d;
      const mins = Math.round(diffMs / 60000);
      const hours = Math.round(diffMs / 3600000);
      const days = Math.round(diffMs / 86400000);
      if (diffMs < 60 * 60000) return `Overdue · ${mins}m`;
      if (diffMs < 24 * 3600000) return `Overdue · ${hours}h`;
      return `Overdue · ${days}d`;
    }
    const sameDay = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (sameDay) return `Due today ${timePart}`;
    if (d.toDateString() === tomorrow.toDateString()) return `Due tomorrow ${timePart}`;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDue = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const days = Math.round((startOfDue - startOfToday) / 86400000);
    return `Due in ${days} days`;
  }

  function formatDueBadge(iso) {
    const d = new Date(iso);
    const now = new Date();
    const t = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sameDay = d.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (sameDay) return `Today ${t}`;
    if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow ${t}`;
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  }

  async function saveDueIso(iso) {
    if (!selectedTask) return;
    setSelectedTask((prev) => (prev ? { ...prev, dueAt: iso } : prev));
    await setDueDate(selectedTask.id, iso);
    showNotification?.(iso ? 'Due date set' : 'Due date cleared');
  }

  function setPreset(daysFromNow) {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    d.setDate(d.getDate() + daysFromNow);
    setDueDateStr(toYmd(d));
    setDueTimeStr(toHm(d));
    saveDueIso(d.toISOString());
  }

  function clearDue() {
    setDueDateStr('');
    setDueTimeStr('');
    saveDueIso(null);
  }

  function snooze(days = 1) {
    const base = selectedTask?.dueAt ? new Date(selectedTask.dueAt) : new Date();
    base.setDate(base.getDate() + days);
    setDueDateStr(toYmd(base));
    setDueTimeStr(toHm(base));
    saveDueIso(base.toISOString());
  }

  const scheduleSaveNotes = (value) => {
    if (!selectedTask) return;
    if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    notesDebounceRef.current = setTimeout(() => {
      setNote(selectedTask.id, value);
      setSelectedTask((prev) => (prev ? { ...prev, notes: value } : prev));
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    };
  }, []);

  const handleDelete = async () => {
    if (!selectedTask) return;
    await deleteTask(selectedTask.id);
    showNotification?.('Task deleted');
    closeTaskModal();
  };

  return (
    <div className="home">
      <h1>taskflow.</h1>

      {isLoggedIn && user && <div className="user-info">Welcome back, {user.username}!</div>}

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
                className={`task-box task-row-clickable ${leavingId === task.id ? 'leaving' : ''}`}
                onClick={() => openTaskModal(task)}
              >
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={task.completed}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    if (e.target.checked) handleCompleteWithFade(task.id);
                  }}
                />
                <span className="task-text">{task.text}</span>

                {task.dueAt && (
                  <span className={`due-badge ${dueState(task.dueAt) || 'future'}`}>
                    {formatDueBadge(task.dueAt)}
                  </span>
                )}

                <button
                  className="info-button"
                  title="Details"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTaskModal(task);
                  }}
                  aria-label="Open task details"
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
            {isLoggedIn ? <LogoutIcon className="auth-icon" /> : <LoginIcon className="auth-icon" />}
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
            {darkMode ? <LightIcon className="mode-icon" /> : <DarkIcon className="mode-icon" />}
          </button>
        </div>
      </div>

      <TaskModal isOpen={!!selectedTask} onClose={closeTaskModal}>
        <div className="task-details">
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Task Details</h2>

          <div className="title-block section-block">
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

          <div className="status-block section-block">
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

          <div className="due-block section-block">
            <div className="section-label">Due date</div>
            <div className="due-row">
              <input
                type="date"
                className="due-input"
                value={dueDateStr}
                data-empty={dueDateStr ? 'false' : 'true'}
                onChange={(e) => {
                  const v = e.target.value;
                  setDueDateStr(v);
                  const iso = localPartsToIso(v, dueTimeStr);
                  saveDueIso(iso);
                }}
                aria-label="Due date"
              />
              <input
                type="time"
                className="due-input"
                value={dueTimeStr}
                data-empty={dueTimeStr ? 'false' : 'true'}
                onChange={(e) => {
                  const v = e.target.value;
                  setDueTimeStr(v);
                  const iso = localPartsToIso(dueDateStr, v);
                  saveDueIso(iso);
                }}
                aria-label="Due time"
              />
            </div>

            <div className="preset-chips">
              <button className="chip chip-primary" onClick={() => setPreset(0)}>Today</button>
              <button className="chip chip-primary" onClick={() => setPreset(1)}>Tomorrow</button>
              <button className="chip chip-primary" onClick={() => setPreset(7)}>Next week</button>
              <button className="chip chip-subtle" onClick={() => snooze(1)}>Snooze +1d</button>
              <button className="chip chip-danger" onClick={clearDue}>Clear</button>
            </div>

            {selectedTask?.dueAt && (
              <div className={`due-hint ${dueState(selectedTask.dueAt)}`}>
                {humanizeDue(selectedTask.dueAt)}
              </div>
            )}
          </div>

          <div className="notes-block section-block">
            <div className="section-label">Notes</div>
            <textarea
              className="notes-textarea"
              placeholder="Write notes…"
              rows={5}
              value={notesStr}
              onChange={(e) => {
                const v = e.target.value;
                setNotesStr(v);
                scheduleSaveNotes(v);
              }}
              onBlur={() => {
                if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
                if (selectedTask) {
                  setNote(selectedTask.id, notesStr);
                  setSelectedTask((prev) => (prev ? { ...prev, notes: notesStr } : prev));
                }
              }}
              aria-label="Notes"
            />
          </div>

          <div className="modal-footer">
            {!confirmingDelete ? (
              <button
                className="delete-button"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Delete task"
              >
                Delete task
              </button>
            ) : (
              <div className="delete-confirm">
                <span className="confirm-text">Delete this task?</span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmingDelete(false)}
                  aria-label="Cancel delete"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  aria-label="Confirm delete"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </TaskModal>
    </div>
  );
}

export default Home;
