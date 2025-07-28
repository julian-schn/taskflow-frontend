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

  // Note: The backend doesn't have update/toggle endpoints, so these work locally only
  // You might want to add these endpoints to your backend or implement them differently
  const toggleComplete = (id) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    // TODO: Add API call to update task status when backend supports it
    console.warn('toggleComplete: Local update only - backend update not implemented');
  };

  const editTask = (id, newText) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, text: newText, isEditing: false } : task
      )
    );
    // TODO: Add API call to update task when backend supports it
    console.warn('editTask: Local update only - backend update not implemented');
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
