'use client';
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { format, subDays } from 'date-fns';

// Import all the components
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import FocusModeContent from '../components/FocusModeContent';
import PomodoroContent from '../components/PomodoroContent';
import TasksPage from '../components/TasksPage';
import SettingsContent from '../components/SettingsContent';
import ProfileContent from '../components/ProfileContent';
import AIAssistantContent from '../components/AIAssistantContent';
import ProductivityModal from '../components/ProductivityModal';
import WelcomeModal from '../components/WelcomeModal';

export default function Home() {
  const [activeSection, setActiveSection] = useState('tasks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [productivityLevel, setProductivityLevel] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showProductivityModal, setShowProductivityModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Default user data for new users or if localStorage is empty/corrupted
  const defaultUserData = {
    name: 'User',
    totalTasksCompleted: 0,
    totalFocusTime: 0,
    totalPomodoroSessions: 0,
    currentStreak: 0,
    xp: 0,
    level: 1,
    dailyStats: [],
    history: [],
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUserData = localStorage.getItem('focus-app-user');
        const storedTasks = localStorage.getItem('focus-app-tasks');
        const storedProductivity = localStorage.getItem('focus-app-productivity-level');

        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
          if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
          }
          if (storedProductivity) {
            setProductivityLevel(storedProductivity);
          }
          setShowProductivityModal(true);
        } else {
          setUserData(defaultUserData);
          setShowWelcomeModal(true);
        }
      } catch (error) {
        console.error("Failed to parse data from localStorage:", error);
        setUserData(defaultUserData);
        setShowWelcomeModal(true);
        setShowProductivityModal(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && tasks) {
      localStorage.setItem('focus-app-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof window !== 'undefined' && userData) {
      localStorage.setItem('focus-app-user', JSON.stringify(userData));
    }
  }, [userData]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && productivityLevel) {
      localStorage.setItem('focus-app-productivity-level', productivityLevel);
    }
  }, [productivityLevel]);

  const handleSectionChange = (section, task = null) => {
    setActiveSection(section);
    setActiveTask(task);
    setIsSidebarOpen(false);
  };
  
  const handleSetProductivity = (level) => {
    setProductivityLevel(level);
    setShowProductivityModal(false);
  };
  
  const handleSetUserInfo = (info) => {
    const newUser = {
      ...defaultUserData,
      ...info,
    };
    setUserData(newUser);
    setShowWelcomeModal(false);
    setShowProductivityModal(true);
  };

  const handleTaskCompletion = (taskId, duration) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );

    setUserData(prevUserData => {
      const currentData = prevUserData || defaultUserData;

      const newTotalTasksCompleted = currentData.totalTasksCompleted + 1;
      const newTotalFocusTime = currentData.totalFocusTime + duration;
      const newTotalPomodoroSessions = currentData.totalPomodoroSessions + 1;
      
      const xpGained = 10 * duration;
      const newXp = currentData.xp + xpGained;
      const newLevel = Math.floor(newXp / 1000) + 1;

      let newCurrentStreak = currentData.currentStreak;
      const today = format(new Date(), 'yyyy-MM-dd');
      const lastActivityDate = currentData.history?.length > 0
        ? format(new Date(currentData.history[0].completedAt), 'yyyy-MM-dd')
        : null;

      if (lastActivityDate === null) {
        newCurrentStreak = 1;
      } else if (lastActivityDate === format(subDays(new Date(), 1), 'yyyy-MM-dd')) {
        newCurrentStreak += 1;
      } else if (lastActivityDate !== today) {
        newCurrentStreak = 1;
      }

      const newDailyStats = [...(currentData.dailyStats || [])];
      const todayStatsIndex = newDailyStats.findIndex(d => d.date === today);

      if (todayStatsIndex !== -1) {
        newDailyStats[todayStatsIndex].tasksCompleted += 1;
        newDailyStats[todayStatsIndex].focusTime += duration;
      } else {
        newDailyStats.push({
          date: today,
          tasksCompleted: 1,
          focusTime: duration
        });
      }

      const completedTask = tasks.find(t => t.id === taskId);
      const newHistory = [
        {
          title: `Completed: ${completedTask?.title || 'Unknown Task'}`,
          type: 'Pomodoro',
          completedAt: new Date().toISOString()
        },
        ...(currentData.history || [])
      ].slice(0, 10);

      return {
        ...currentData,
        totalTasksCompleted: newTotalTasksCompleted,
        totalFocusTime: newTotalFocusTime,
        totalPomodoroSessions: newTotalPomodoroSessions,
        currentStreak: newCurrentStreak,
        xp: newXp,
        level: newLevel,
        dailyStats: newDailyStats,
        history: newHistory,
      };
    });
  };

  // --- NEW: Task management functions for CRUD operations ---
  const createTask = (newTask) => {
    setTasks(prevTasks => [
      ...prevTasks,
      {
        ...newTask,
        id: Date.now(), // Simple unique ID
        completed: false
      }
    ]);
  };

  const updateTask = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  // --- END NEW FUNCTIONS ---

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent
          tasks={tasks}
          userData={userData}
        />;
      case 'focus':
        return <FocusModeContent
          activeTask={activeTask}
          setTasks={setTasks}
          setUserData={setUserData}
        />;
      case 'pomodoro':
        return <PomodoroContent
          activeTask={activeTask}
          setTasks={setTasks}
          setUserData={setUserData}
        />;
      case 'tasks':
        return <TasksPage
          tasks={tasks}
          setTasks={setTasks}
          onPlayTask={handleSectionChange}
          productivityLevel={productivityLevel}
          setUserData={setUserData}
          // Correct props for TasksPage
          onTaskComplete={handleTaskCompletion}
          createTask={createTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          userData={userData}
        />;
      case 'settings':
        return <SettingsContent userData={userData} setUserData={setUserData} />;
      case 'profile':
        return <ProfileContent
          userData={userData}
          setUserData={setUserData}
          setTasks={setTasks}
          setProductivityLevel={setProductivityLevel}
          setShowProductivityModal={setShowProductivityModal}
        />;
      case 'ai':
        return <AIAssistantContent />;
      default:
        return <DashboardContent
          tasks={tasks}
          userData={userData}
        />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="md:hidden p-4 flex justify-between items-center bg-white shadow-md">
        <h1 className="text-xl font-bold text-gray-800">Focus App</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <Sidebar
          activeSection={activeSection}
          handleSectionChange={handleSectionChange}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>

      <ProductivityModal
        isOpen={showProductivityModal}
        onSubmit={handleSetProductivity}
      />

      <WelcomeModal
        isOpen={showWelcomeModal}
        onSubmit={handleSetUserInfo}
      />
    </div>
  );
}