import React, { useState } from 'react';
import './Home.css';
import deleteIcon from '../assets/delete_icon.svg';
import editIcon from "../assets/edit_icon.svg";
import { NavLink } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';

function Home() {
  const [taskInput, setTaskInput] = useState('');
  const { tasks, addTask, deleteTask, toggleComplete, editTask, startEdit } = useTasks();

  const handleAddTask = () => {
    if (taskInput.trim() === '') return;
    addTask(taskInput);
    setTaskInput('');
  };

  return (
    <div className="home">
      <h1>taskflow.</h1>

      <div className="input-box">
        <input
          type="text"
          className="task-input"
          placeholder="Add a new task"
          value={taskInput}
          maxLength={50}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <button className="box-button" onClick={handleAddTask}>Add</button>
      </div>

      <div className="task-list">
        {tasks.filter(task => !task.completed).map((task) => (
          <div key={task.id} className="task-box">
            <input
              type="checkbox"
              className="task-checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task.id)}
            />

            {task.isEditing ? (
              <input
                className="task-input"
                autoFocus
                value={task.text}
                maxLength={50}
                onChange={(e) => editTask(task.id, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && editTask(task.id, task.text)}
                onBlur={() => editTask(task.id, task.text)}
              />
            ) : (
              <span>{task.text}</span>
            )}

            <div className="task-actions">
              <button className="edit-button" onClick={() => startEdit(task.id)}>
                <img src={editIcon} alt="Edit Task" className="icon" />
              </button>
              <button className="delete-button" onClick={() => deleteTask(task.id)}>
                <img src={deleteIcon} alt="Delete Task" className="icon" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-buttons">
        <NavLink to="/" end className={({ isActive }) => `filter-button ${isActive ? 'active' : ''}`}>All</NavLink>
        <NavLink to="/completed" className={({ isActive }) => `filter-button ${isActive ? 'active' : ''}`}>Completed</NavLink>
      </div>
    </div>
  );
}

export default Home;
