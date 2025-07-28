import React, { createContext, useContext, useState, useEffect } from 'react';
import { todoAPI } from '../services/api.js';
import { useAuth } from '../pages/AuthContext.js';

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, isLoggedIn } = useAuth();

  // Load tasks when user logs in
  useEffect(() => {
    if (isLoggedIn && token) {
      loadTasks();
    } else {
      setTasks([]); // Clear tasks when logged out
    }
  }, [isLoggedIn, token]);

  // Load all tasks from API
  const loadTasks = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const apiTasks = await todoAPI.getAll(token);
      // Transform API response to match local state structure
      const transformedTasks = apiTasks.map(task => ({
        id: task.id,
        text: task.title,
        description: task.description,
        completed: task.status === 'COMPLETED',
        isEditing: false,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (text, description = '') => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newTask = await todoAPI.create(text, description, token);
      const transformedTask = {
        id: newTask.id,
        text: newTask.title,
        description: newTask.description,
        completed: newTask.status === 'COMPLETED',
        isEditing: false,
        createdAt: newTask.createdAt,
        updatedAt: newTask.updatedAt
      };
      setTasks(prev => [...prev, transformedTask]);
    } catch (error) {
      console.error('Failed to add task:', error);
      setError('Failed to add task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await todoAPI.delete(id, token);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion status via API
  const toggleComplete = async (id) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    // Find the task to toggle
    const taskToToggle = tasks.find(task => task.id === id);
    if (!taskToToggle) {
      setError('Task not found');
      return;
    }

    // Optimistically update the UI first
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );

    try {
      // Call the toggle API
      const updatedTask = await todoAPI.toggle(id, token);
      
      // Update with the server response
      setTasks(prev =>
        prev.map(task =>
          task.id === id ? {
            ...task,
            completed: updatedTask.status === 'COMPLETED',
            updatedAt: updatedTask.updatedAt
          } : task
        )
      );
      
    } catch (error) {
      console.error('Failed to toggle task:', error);
      
      // Revert the optimistic update on error
      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, completed: taskToToggle.completed } : task
        )
      );
      
      // Show user-friendly error
      if (error.message.includes('404')) {
        setError('Task not found. It may have been deleted.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        setError('You are not authorized to modify this task.');
      } else {
        setError('Failed to update task status. Please try again.');
      }
    }
  };

  // Edit task title via API
  const editTask = async (id, newText) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    // Find the task to edit
    const taskToEdit = tasks.find(task => task.id === id);
    if (!taskToEdit) {
      setError('Task not found');
      return;
    }

    // Optimistically update the UI first
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, text: newText, isEditing: false } : task
      )
    );

    setLoading(true);
    setError(null);
    
    try {
      // Call the update API
      const updatedTask = await todoAPI.update(id, newText, token);
      
      // Update with the server response
      setTasks(prev =>
        prev.map(task =>
          task.id === id ? {
            ...task,
            text: updatedTask.title,
            description: updatedTask.description,
            updatedAt: updatedTask.updatedAt,
            isEditing: false
          } : task
        )
      );
      
    } catch (error) {
      console.error('Failed to edit task:', error);
      
      // Revert the optimistic update on error
      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, text: taskToEdit.text, isEditing: false } : task
        )
      );
      
      // Show user-friendly error
      if (error.message.includes('404')) {
        setError('Task not found. It may have been deleted.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        setError('You are not authorized to edit this task.');
      } else if (error.message.includes('400')) {
        setError('Title is too long (max 100 characters) or validation failed.');
      } else {
        setError('Failed to update task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
    // TODO: Add API call to update task order when backend supports it
    console.warn('moveTaskUp: Local update only - backend update not implemented');
  };

  const moveTaskDown = (id) => {
    setTasks(prev => {
      const index = prev.findIndex(task => task.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;

      const newTasks = [...prev];
      [newTasks[index + 1], newTasks[index]] = [newTasks[index], newTasks[index + 1]];
      return newTasks;
    });
    // TODO: Add API call to update task order when backend supports it
    console.warn('moveTaskDown: Local update only - backend update not implemented');
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      setTasks,
      loading,
      error,
      addTask,
      deleteTask,
      toggleComplete,
      editTask,
      startEdit,
      moveTaskUp,
      moveTaskDown,
      loadTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
};
