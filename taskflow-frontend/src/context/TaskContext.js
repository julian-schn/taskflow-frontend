import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const addTask = (text) => {
    setTasks(prev => [...prev, {
      id: Date.now(), 
      text,
      completed: false,
      isEditing: false,
    }]);
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const editTask = (id, newText) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, text: newText, isEditing: false } : task
      )
    );
  };

  const startEdit = (id) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, isEditing: true } : task
      )
    );
  };

  const moveTaskUp = (id) => {
    setTasks(prev => {
      const index = prev.findIndex(task => task.id === id);
      if (index <= 0) return prev;

      const newTasks = [...prev];
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
      return newTasks;
    });
  };

  const moveTaskDown = (id) => {
    setTasks(prev => {
      const index = prev.findIndex(task => task.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;

      const newTasks = [...prev];
      [newTasks[index + 1], newTasks[index]] = [newTasks[index], newTasks[index + 1]];
      return newTasks;
    });
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      setTasks,
      addTask,
      deleteTask,
      toggleComplete,
      editTask,
      startEdit,
      moveTaskUp,
      moveTaskDown
    }}>
      {children}
    </TaskContext.Provider>
  );
};
