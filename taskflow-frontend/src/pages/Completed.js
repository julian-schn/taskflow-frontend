import React, { useState } from 'react';
import './Completed.css';
import { NavLink } from 'react-router-dom';
import deleteIcon from '../assets/delete_icon.svg';
import editIcon from '../assets/edit_icon.svg';
import { useTasks } from '../context/TaskContext';

function Completed() {
  const { tasks, toggleComplete, deleteTask, editTask, startEdit } = useTasks();
  const [editText, setEditText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);

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
    editTask(taskId, tasks.find(t => t.id === taskId).text); // reset editing mode
  };

  return (
    <div className="completed">
      <h1>taskflow.</h1>
      <h2>Completed Tasks:</h2>

      {completedTasks.length === 0 ? (
        <p>No completed tasks yet.</p>
      ) : (
        <div className="task-list">
          {completedTasks.map((task) => (
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
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
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
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="filter-buttons">
        <NavLink to="/" end className={({ isActive }) => `filter-button ${isActive ? 'active' : ''}`}>All</NavLink>
        <NavLink to="/completed" className={({ isActive }) => `filter-button ${isActive ? 'active' : ''}`}>Completed</NavLink>
      </div>
    </div>
  );
}

export default Completed;
