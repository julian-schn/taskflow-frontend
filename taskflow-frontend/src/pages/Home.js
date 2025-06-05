import React, { useState } from 'react';
import './Home.css';
import deleteIcon from '../assets/delete_icon.svg';
import editIcon from "../assets/edit_icon.svg";

function Home() {
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleDeleteTask = (indexToDelete) => {
    setTasks(tasks.filter((_, index) => index !== indexToDelete));
  };

  const handleAddTask = () => {
    if (taskInput.trim() === '') return;
    setTasks([...tasks, { text: taskInput, isEditing: false }]);
    setTaskInput('');
  };

  const handleEditTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].isEditing = true;
    setTasks(updatedTasks);
  };

  const handleSaveTask = (index, newText) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].text = newText;
    updatedTasks[index].isEditing = false;
    setTasks(updatedTasks);
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
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddTask();
            }
          }}
        />
        <button className="box-button" onClick={handleAddTask}>Add</button>
      </div>

      <div className="task-list">
        {tasks.map((task, index) => (
          <div key={index} className="task-box">
            <input type="checkbox" className="task-checkbox" />

            {task.isEditing ? (
              <input
                className="task-input"
                autoFocus
                value={task.text}
                onChange={(e) => {
                  const updatedTasks = [...tasks];
                  updatedTasks[index].text = e.target.value;
                  setTasks(updatedTasks);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTask(index, task.text);
                  }
                }}
                onBlur={() => handleSaveTask(index, task.text)}
              />
            ) : (
              <span>{task.text}</span>
            )}

            <div className="task-actions">
              <button className="edit-button" onClick={() => handleEditTask(index)}>
                <img src={editIcon} alt="Edit Task" className="icon" />
              </button>
              <button className="delete-button" onClick={() => handleDeleteTask(index)}>
                <img src={deleteIcon} alt="Delete Task" className="icon" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-buttons">
        <button
          onClick={() => setActiveFilter('all')}
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`filter-button ${activeFilter === 'completed' ? 'active' : ''}`}
        >
          Completed
        </button>
      </div>
    </div>
  );
}

export default Home;
