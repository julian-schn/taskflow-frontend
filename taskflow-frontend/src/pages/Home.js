import React, { useState } from 'react';
import './Home.css';
import deleteIcon from '../assets/delete_icon.svg';
import editIcon from "../assets/edit_icon.svg";

function Home() {
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);

  const handleAddTask = () => {
    if (taskInput.trim() === '') return;
    setTasks([...tasks, taskInput]);
    setTaskInput('');
  };

  return (
    <div className="home">
      <h1>taskflow</h1>

      <div className="task-box">
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
            <span>{task}</span>

            <div className="task-actions">
            <button className="edit-button">
              <img src={editIcon} alt="Edit Task" className="icon"/>
            </button>
            <button className="delete-button">
                <img src={deleteIcon} alt="Delete Task" className="icon" />
            </button>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
