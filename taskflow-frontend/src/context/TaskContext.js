// src/context/TaskContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { todoAPI } from '../services/api.js';
import { useAuth } from './AuthContext.js';

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

// Vereinheitlicht das Task-Format aus der API
const toLocalTask = (apiTask) => {
  const completed =
    typeof apiTask.completed === 'boolean'
      ? apiTask.completed
      : apiTask.status === 'COMPLETED';

  const completedAt =
    apiTask.completedAt ?? (completed ? apiTask.updatedAt ?? null : null);

  return {
    id: apiTask.id,
    text: apiTask.title,
    description: apiTask.description,
    completed,
    completedAt,
    isEditing: false,
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  };
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, isLoggedIn } = useAuth();

  // Alle Tasks laden (stabilisiert für useEffect)
  const loadTasks = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const apiTasks = await todoAPI.getAll(token);
      setTasks(apiTasks.map(toLocalTask));
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Tasks laden, wenn eingeloggt; leeren beim Ausloggen
  useEffect(() => {
    if (isLoggedIn && token) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [isLoggedIn, token, loadTasks]);

  const addTask = async (text, description = '') => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newTask = await todoAPI.create(text, description, token);
      setTasks((prev) => [...prev, toLocalTask(newTask)]);
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
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Completed (+ completedAt pflegen)
  const toggleComplete = async (id) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    const taskToToggle = tasks.find((task) => task.id === id);
    if (!taskToToggle) {
      setError('Task not found');
      return;
    }

    const willComplete = !taskToToggle.completed;
    const optimisticTime = willComplete ? new Date().toISOString() : null;

    // Optimistic UI
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: willComplete, completedAt: optimisticTime }
          : task
      )
    );

    try {
      const updatedTask = await todoAPI.toggle(id, token);

      const completed =
        typeof updatedTask.completed === 'boolean'
          ? updatedTask.completed
          : updatedTask.status === 'COMPLETED';

      const completedAt =
        updatedTask.completedAt ??
        (completed ? updatedTask.updatedAt ?? optimisticTime : null);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                completed,
                completedAt,
                updatedAt: updatedTask.updatedAt,
              }
            : task
        )
      );
    } catch (error) {
      console.error('Failed to toggle task:', error);
      // Revert
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: taskToToggle.completed,
                completedAt: taskToToggle.completedAt,
              }
            : task
        )
      );

      if (error.message.includes('404')) {
        setError('Task not found. It may have been deleted.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        setError('You are not authorized to modify this task.');
      } else {
        setError('Failed to update task status. Please try again.');
      }
    }
  };

  // Edit Title
  const editTask = async (id, newText) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    const taskToEdit = tasks.find((task) => task.id === id);
    if (!taskToEdit) {
      setError('Task not found');
      return;
    }

    // Optimistic UI
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text: newText, isEditing: false } : task
      )
    );

    setLoading(true);
    setError(null);

    try {
      const updatedTask = await todoAPI.update(id, newText, token);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                text: updatedTask.title,
                description: updatedTask.description,
                updatedAt: updatedTask.updatedAt,
                completedAt:
                  updatedTask.completedAt ??
                  (task.completed ? updatedTask.updatedAt ?? task.completedAt : null),
                isEditing: false,
              }
            : task
        )
      );
    } catch (error) {
      console.error('Failed to edit task:', error);
      // Revert
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, text: taskToEdit.text, isEditing: false } : task
        )
      );

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
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, isEditing: true } : task))
    );
  };

  const moveTaskUp = (id) => {
    setTasks((prev) => {
      const index = prev.findIndex((task) => task.id === id);
      if (index <= 0) return prev;

      const newTasks = [...prev];
      [newTasks[index - 1], newTasks[index]] = [
        newTasks[index],
        newTasks[index - 1],
      ];
      return newTasks;
    });
    console.warn('moveTaskUp: Local update only - backend update not implemented');
  };

  const moveTaskDown = (id) => {
    setTasks((prev) => {
      const index = prev.findIndex((task) => task.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;

      const newTasks = [...prev];
      [newTasks[index + 1], newTasks[index]] = [
        newTasks[index],
        newTasks[index + 1],
      ];
      return newTasks;
    });
    console.warn('moveTaskDown: Local update only - backend update not implemented');
  };

  return (
    <TaskContext.Provider
      value={{
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
        loadTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
