import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useAuthTasks() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tasks when authentication state changes
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      loadTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tasks');
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        throw new Error('Failed to load tasks');
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      setError(null);

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev]);
        return newTask;
      } else {
        throw new Error('Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      setError(null);

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId, ...updates }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task => 
          task._id === taskId ? updatedTask : task
        ));
        return updatedTask;
      } else {
        throw new Error('Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError(null);

      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId }),
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task._id !== taskId));
        return true;
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message);
      throw err;
    }
  };

  const completeTask = async (taskId, completionData = {}) => {
    try {
      const updates = {
        completed: true,
        completedAt: new Date(),
        ...completionData
      };

      return await updateTask(taskId, updates);
    } catch (err) {
      console.error('Error completing task:', err);
      throw err;
    }
  };

  const getTasksByStatus = (status) => {
    if (status === 'completed') {
      return tasks.filter(task => task.completed);
    } else if (status === 'pending') {
      return tasks.filter(task => !task.completed);
    }
    return tasks;
  };

  const getTasksByPriority = (priority) => {
    return tasks.filter(task => task.priority === priority);
  };

  const getTasksByDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === targetDate.getTime();
    });
  };

  return {
    tasks,
    loading,
    error,
    isSignedIn,
    isLoaded,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByDate,
    refreshTasks: loadTasks
  };
}
