import React from 'react';
import './Completed.css';
import { NavLink } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';

function Completed() {
  const { tasks, toggleComplete } = useTasks();

  const completedTasks = tasks.filter(task => task.completed);

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
              <span>{task.text}</span>
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
