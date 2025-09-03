'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format, subDays, isSameDay } from 'date-fns';

// 1. CREATE THE CONTEXT
// We provide a default shape to prevent errors on the initial render.
const DataContext = createContext({
  userData: null,
  tasks: [],
  isLoading: true,
  setUserData: () => {},
  createTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  completeTask: () => {},
});

// 2. CREATE THE PROVIDER COMPONENT
// This component will wrap your entire application.
export function DataProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA PERSISTENCE ---

  // Effect to load data from localStorage only once when the app starts.
  useEffect(() => {
    try {
      const storedTasks = JSON.parse(localStorage.getItem('focus_app_tasks')) || [];
      const storedUserData = JSON.parse(localStorage.getItem('focus_app_userData'));

      setTasks(storedTasks);
      if (storedUserData) {
        setUserData(storedUserData);
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage:", error);
      // Reset to a safe default state if data is corrupt
      setTasks([]);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // The empty array [] ensures this runs only once.

  // Effect to save tasks whenever the `tasks` state changes.
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('focus_app_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  // Effect to save user data whenever it changes.
  useEffect(() => {
    if (!isLoading && userData) {
      localStorage.setItem('focus_app_userData', JSON.stringify(userData));
    }
  }, [userData, isLoading]);
  
  // --- CENTRALIZED ACTION FUNCTIONS ---
  // All logic for modifying data is handled here.

  const createTask = useCallback((newTaskData) => {
    const task = {
      ...newTaskData,
      _id: new Date().toISOString(), // Use a timestamp for a unique ID
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prevTasks => [task, ...prevTasks]);
  }, []);

  const updateTask = useCallback((updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
  }, []);

  const completeTask = useCallback((taskId, duration) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const isCompleted = !task.completed; // Toggle the state

    // 1. Update the task's completion status
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t._id === taskId ? { ...t, completed: isCompleted } : t
      )
    );

    // 2. Update user statistics only when a task is marked as complete
    if (isCompleted) {
        setUserData(prev => {
            if (!prev) return null; // Safety check

            const today = format(new Date(), 'yyyy-MM-dd');
            const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
            
            // Streak Logic
            const lastDate = prev.history?.[0]?.completedAt ? format(new Date(prev.history[0].completedAt), 'yyyy-MM-dd') : null;
            let newStreak = prev.currentStreak || 0;
            if (lastDate === yesterday) {
                newStreak += 1;
            } else if (lastDate !== today) {
                newStreak = 1;
            }
            
            // History & Stats
            const newHistory = [{ title: task.title, _id: new Date().toISOString(), type: 'Task', completedAt: new Date().toISOString() }, ...(prev.history || [])].slice(0, 20);
            
            return {
                ...prev,
                xp: (prev.xp || 0) + (duration * 5),
                level: Math.floor(((prev.xp || 0) + (duration * 5)) / 1000) + 1,
                totalFocusTime: (prev.totalFocusTime || 0) + duration,
                currentStreak: newStreak,
                history: newHistory,
            };
        });
    }
  }, [tasks]);


  // The value object that will be available to all consuming components
  const value = {
    userData,
    setUserData, // Exposed for direct profile edits
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// 3. CREATE A CUSTOM HOOK
// This makes it easy for components to get the data without extra imports.
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
