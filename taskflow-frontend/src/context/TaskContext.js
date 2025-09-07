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
    dueAt: null,
    notes: '',
  };
};

const blankMeta = { dueAt: {}, notes: {} };

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, isLoggedIn, user } = useAuth();

  const metaKey =
    user?.id
      ? `taskflow_meta_${user.id}`
      : user?.username
      ? `taskflow_meta_${user.username}`
      : 'taskflow_meta_anon';

  const readMeta = () => {
    try {
      const raw = localStorage.getItem(metaKey);
      const parsed = raw ? JSON.parse(raw) : blankMeta;
      return {
        ...blankMeta,
        ...parsed,
        dueAt: { ...blankMeta.dueAt, ...(parsed?.dueAt || {}) },
        notes: { ...blankMeta.notes, ...(parsed?.notes || {}) },
      };
    } catch {
      return { ...blankMeta };
    }
  };

  const writeMeta = (meta) => {
    try {
      localStorage.setItem(metaKey, JSON.stringify(meta));
    } catch {}
  };

  const setDueDate = async (id, isoOrNull) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, dueAt: isoOrNull } : t)));
    const meta = readMeta();
    if (!isoOrNull) {
      delete meta.dueAt[id];
    } else {
      meta.dueAt[id] = isoOrNull;
    }
    writeMeta(meta);
  };

  const setNote = async (id, text) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, notes: text ?? '' } : t)));
    const meta = readMeta();
    if (!text) {
      delete meta.notes[id];
    } else {
      meta.notes[id] = text;
    }
    writeMeta(meta);
  };

  const loadTasks = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const apiTasks = await todoAPI.getAll(token);
      const base = apiTasks.map(toLocalTask);

      const meta = readMeta();
      const merged = base.map((t) => ({
        ...t,
        dueAt: meta.dueAt?.[t.id] ?? null,
        notes: meta.notes?.[t.id] ?? '',
      }));

      setTasks(merged);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const meta = readMeta();
      setTasks((prev) => [
        ...prev,
        {
          ...toLocalTask(newTask),
          dueAt: meta.dueAt?.[newTask.id] ?? null,
          notes: meta.notes?.[newTask.id] ?? '',
        },
      ]);
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

      const meta = readMeta();
      if (meta.dueAt[id]) {
        delete meta.dueAt[id];
      }
      if (meta.notes[id]) {
        delete meta.notes[id];
      }
      writeMeta(meta);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
        setDueDate,
        setNote,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
