"use client"
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

// Import all the components (no changes here)
import Sidebar from './components/Sidebar';
import DashboardContent from './components/DashboardContent';
import FocusModeContent from './components/FocusModeContent';
import PomodoroContent from './components/PomodoroContent';
import TasksPage from './components/TasksPage';
import SettingsContent from './components/SettingsContent';
import ProfileContent from './components/ProfileContent';
import AIAssistantContent from './components/AIAssistantContent';
import ProductivityModal from './components/ProductivityModal';
import WelcomeModal from './components/WelcomeModal';

// Import custom hooks
import { useAuthUser } from '@/lib/useAuthUser';
import { useAuthTasks } from '@/lib/useAuthTasks';

export default function Home() {
  // Use custom hooks for authentication and data management
  const { userData, loading: userLoading, error: userError, isSignedIn, updateProgress } = useAuthUser();
  const { tasks, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask } = useAuthTasks();
  
  // Local state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [productivityLevel, setProductivityLevel] = useState(null);
  const [showProductivityModal, setShowProductivityModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Show productivity modal for new users or when productivity level is not set
  useEffect(() => {
    if (isSignedIn && userData && !productivityLevel) {
      setShowProductivityModal(true);
    }
  }, [isSignedIn, userData, productivityLevel]);

  // Show welcome modal for new users
  useEffect(() => {
    if (isSignedIn && userData && !userData.purpose) {
      setShowWelcomeModal(true);
    }
  }, [isSignedIn, userData]);

  // Handler to change the active section (no changes here).
  const handleSectionChange = (section, task = null) => {
    setActiveSection(section);
    setActiveTask(task);
    setIsSidebarOpen(false);
  };
  
  // Handle productivity level setting
  const handleSetProductivity = async (level) => {
    setProductivityLevel(level);
    setShowProductivityModal(false);
    
    // Update user preferences in database
    if (userData) {
      try {
        await updateProgress({
          preferences: {
            ...userData.preferences,
            productivityLevel: level
          }
        });
      } catch (error) {
        console.error('Failed to save productivity level:', error);
      }
    }
  };
  
  // Handle user info setting (for new users)
  const handleSetUserInfo = async (info) => {
    if (userData) {
      try {
        await updateProgress({
          purpose: info.purpose,
          source: info.source,
          schedule: info.schedule,
          desc: info.desc
        });
        setShowWelcomeModal(false);
      } catch (error) {
        console.error('Failed to save user info:', error);
      }
    }
  };
  

  
  // Loading state
  if (userLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your productivity dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (userError || tasksError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {userError || tasksError}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Momentom</h1>
          <p className="text-gray-600 mb-8">
            Your personal productivity companion. Sign in to start tracking your progress, 
            manage tasks, and boost your productivity with AI assistance.
          </p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold">
              Get Started
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // The rest of the component (renderContent, JSX structure) remains exactly the same.
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent tasks={tasks} userData={userData} />;
      case 'focus':
        return <FocusModeContent 
          activeTask={activeTask} 
          setTasks={setTasks} 
          setUserData={setUserData}
          updateProgress={updateProgress}
          userData={userData}
        />;
      case 'pomodoro':
        return <PomodoroContent 
          activeTask={activeTask} 
          setTasks={setTasks} 
          setUserData={setUserData}
          updateProgress={updateProgress}
          userData={userData}
        />;
      case 'tasks':
        return <TasksPage 
          tasks={tasks} 
          setTasks={setTasks} 
          onPlayTask={handleSectionChange} 
          productivityLevel={productivityLevel} 
          setUserData={setUserData}
          createTask={createTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
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
        return <DashboardContent tasks={tasks} userData={userData} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      
      <div className="md:hidden p-4 flex justify-between items-center bg-white shadow-md">
        <h1 className="text-xl font-bold text-gray-800">Momentom</h1>
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

// "use client"
// import React, { useState, useEffect, useRef } from 'react';
// import { LayoutDashboard, Timer, LucideFocus, Settings, User, Menu, X, CircleCheck, ListTodo, Plus, Search, Calendar, Clock, Zap, Play, Edit, Trash2, TrendingUp, TrendingDown, RefreshCw, Pause, StopCircle, Bot, Music } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { format, subDays, getDayOfYear, isSameDay } from 'date-fns';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// // -----------------------------------------------------------------------------
// // 1. Main App Component
// //    This is the main container for the entire application.
// // -----------------------------------------------------------------------------
// function App() {
//   // State to track which section is currently active (e.g., 'dashboard', 'tasks').
//   const [activeSection, setActiveSection] = useState('tasks');
//   // State to control the mobile sidebar's visibility.
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   // State to control the desktop sidebar's collapsed state.
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   // State to track the currently selected task for the timer.
//   const [activeTask, setActiveTask] = useState(null);

//   // Tasks state initialized as empty.
//   const [tasks, setTasks] = useState([]);

//   // Productivity level
//   const [productivityLevel, setProductivityLevel] = useState(null);

//   // User data initialized as null.
//   const [userData, setUserData] = useState(null);

//   // Modals
//   const [showProductivityModal, setShowProductivityModal] = useState(false);
//   const [showWelcomeModal, setShowWelcomeModal] = useState(false);

//   // EDITED: This effect now ensures the app starts fresh every time.
//   // It no longer loads data from localStorage, forcing the initial setup flow.
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Show the welcome modal to simulate a first-time user experience.
//       setShowWelcomeModal(true);
//       // Show the productivity modal as part of the initial setup.
//       setShowProductivityModal(true);
//     }
//   }, []);


//   // Save tasks to localStorage (persistence for the current session)
//   useEffect(() => {
//     if (typeof window !== 'undefined' && tasks.length > 0) {
//       localStorage.setItem('focus-app-tasks', JSON.stringify(tasks));
//     }
//   }, [tasks]);

//   // Save user data (persistence for the current session)
//   useEffect(() => {
//     if (typeof window !== 'undefined' && userData) {
//       localStorage.setItem('focus-app-user', JSON.stringify(userData));
//     }
//   }, [userData]);

//   // Handler to change the active section.
//   const handleSectionChange = (section, task = null) => {
//     setActiveSection(section);
//     setActiveTask(task);
//     setIsSidebarOpen(false); // Close sidebar on mobile
//   };

//   // Helper function to render the correct content based on the active section.
//   const renderContent = () => {
//     switch (activeSection) {
//       case 'dashboard':
//         return <DashboardContent tasks={tasks} userData={userData} />;
//       case 'focus':
//         return <FocusModeContent activeTask={activeTask} setTasks={setTasks} setUserData={setUserData} />;
//       case 'pomodoro':
//         return <PomodoroContent activeTask={activeTask} setTasks={setTasks} setUserData={setUserData} />;
//       case 'tasks':
//         return <TasksPage tasks={tasks} setTasks={setTasks} onPlayTask={handleSectionChange} productivityLevel={productivityLevel} setUserData={setUserData} />;
//       case 'settings':
//         return <SettingsContent userData={userData} setUserData={setUserData} />;
//       case 'profile':
//         return <ProfileContent userData={userData} setUserData={setUserData} setTasks={setTasks} setProductivityLevel={setProductivityLevel} setShowProductivityModal={setShowProductivityModal} setShowWelcomeModal={setShowWelcomeModal} />;
//       case 'ai':
//         return <AIAssistantContent />;
//       default:
//         return <DashboardContent tasks={tasks} userData={userData} />;
//     }
//   };

//   const handleSetProductivity = (level) => {
//     setProductivityLevel(level);
//     setShowProductivityModal(false);
//   };

//   const handleSetUserInfo = (info) => {
//     setUserData({
//       ...info,
//       xp: 0,
//       avatar: '',
//       desc: '',
//       history: []
//     });
//     setShowWelcomeModal(false);
//   };

//   return (
//     <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans text-gray-800">

//       {/* Mobile menu button */}
//       <div className="md:hidden p-4 flex justify-between items-center bg-white shadow-md">
//         <h1 className="text-xl font-bold text-gray-800">Focus App</h1>
//         <button
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//           className="p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
//         >
//           {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>

//       {/* Mobile menu overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Sidebar Component */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
//         bg-white shadow-lg p-6 flex flex-col space-y-4
//         ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
//         ${isCollapsed ? 'md:w-20' : 'md:w-64'}
//         md:relative md:translate-x-0 md:p-4`}
//       >
//         <div className="flex justify-between items-center flex-shrink-0 mb-8">
//           {/* Main App Title, only visible when not collapsed */}
//           {!isCollapsed && (
//             <h1 className="text-3xl font-bold text-gray-800 tracking-tight transition-opacity duration-300">Focus App</h1>
//           )}
//           {/* Hamburger/Collapse button for desktop and close for mobile */}
//           <button
//             onClick={() => {
//               // On desktop, toggle the collapsed state
//               if (window.innerWidth >= 768) {
//                 setIsCollapsed(!isCollapsed);
//               } else {
//                 // On mobile, toggle the sidebar's open state
//                 setIsSidebarOpen(!isSidebarOpen);
//               }
//             }}
//             className={`p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
//           >
//             {isCollapsed ? <Menu size={24} /> : <X size={24} />}
//           </button>
//         </div>
//         {/* Navigation links */}
//         <nav className="flex-1 space-y-2">
//           <SidebarItem
//             icon={<LayoutDashboard size={20} />}
//             text="Dashboard"
//             isActive={activeSection === 'dashboard'}
//             onClick={() => handleSectionChange('dashboard')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<LucideFocus size={20} />}
//             text="Focus Mode"
//             isActive={activeSection === 'focus'}
//             onClick={() => handleSectionChange('focus')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<Timer size={20} />}
//             text="Pomodoro"
//             isActive={activeSection === 'pomodoro'}
//             onClick={() => handleSectionChange('pomodoro')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<ListTodo size={20} />}
//             text="Task Manager"
//             isActive={activeSection === 'tasks'}
//             onClick={() => handleSectionChange('tasks')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<Bot size={20} />}
//             text="AI Assistant"
//             isActive={activeSection === 'ai'}
//             onClick={() => handleSectionChange('ai')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<Settings size={20} />}
//             text="Settings"
//             isActive={activeSection === 'settings'}
//             onClick={() => handleSectionChange('settings')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<User size={20} />}
//             text="Profile"
//             isActive={activeSection === 'profile'}
//             onClick={() => handleSectionChange('profile')}
//             isCollapsed={isCollapsed}
//           />
//         </nav>
//       </aside>

//       {/* Main content area */}
//       <main className="flex-1 flex flex-col overflow-y-auto">
//         <div className="p-4 sm:p-6 lg:p-8">
//           {renderContent()}
//         </div>
//       </main>

//       <ProductivityModal
//         isOpen={showProductivityModal}
//         onSubmit={handleSetProductivity}
//       />

//       <WelcomeModal
//         isOpen={showWelcomeModal}
//         onSubmit={handleSetUserInfo}
//       />

//     </div>
//   );
// }

// // -----------------------------------------------------------------------------
// // 3. DashboardContent Component
// // -----------------------------------------------------------------------------
// function DashboardContent({ tasks, userData }) {
//   const completedTasksCount = tasks.filter(task => task.completed).length;
//   const totalTasksToday = tasks.filter(task => task.date === new Date().toISOString().split('T')[0]).length;
//   const tasksDueToday = tasks.filter(task => task.date === new Date().toISOString().split('T')[0] && !task.completed).length;
//   const totalFocusTime = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.duration, 0);

//   // Data for the task completion chart
//   const weeklyData = [
//     { name: format(subDays(new Date(), 6), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 6))).length },
//     { name: format(subDays(new Date(), 5), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 5))).length },
//     { name: format(subDays(new Date(), 4), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 4))).length },
//     { name: format(subDays(new Date(), 3), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 3))).length },
//     { name: format(subDays(new Date(), 2), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 2))).length },
//     { name: format(subDays(new Date(), 1), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 1))).length },
//     { name: format(new Date(), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), new Date())).length },
//   ];

//   return (
//     <div className="p-4 sm:p-6 lg:p-8">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
//       {/* Metric Cards Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Completed Tasks</p>
//             <h2 className="text-3xl font-bold text-gray-800">{completedTasksCount}</h2>
//           </div>
//           <CircleCheck className="w-10 h-10 text-green-500" />
//         </div>
        
//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Total Focus Time</p>
//             <h2 className="text-3xl font-bold text-gray-800">{totalFocusTime} <span className="text-base text-gray-500">min</span></h2>
//           </div>
//           <Clock className="w-10 h-10 text-blue-500" />
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Tasks Due Today</p>
//             <h2 className="text-3xl font-bold text-gray-800">{tasksDueToday}</h2>
//           </div>
//           <ListTodo className="w-10 h-10 text-yellow-500" />
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Postponed</p>
//             <h2 className="text-3xl font-bold text-gray-800">{tasks.filter(t => t.postponedCount > 0).length}</h2>
//           </div>
//           <TrendingDown className="w-10 h-10 text-red-500" />
//         </div>
//       </div>

//       {/* Graphs and Charts Section */}
//       <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Task Completion</h2>
//         <div className="w-full h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={weeklyData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis dataKey="name" tickLine={false} axisLine={false} />
//               <YAxis tickLine={false} axisLine={false} />
//               <Tooltip
//                 contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
//                 labelStyle={{ fontWeight: 'bold' }}
//                 itemStyle={{ color: '#1f2937' }}
//                 formatter={(value) => [`${value} tasks`, 'Completed']}
//               />
//               <Line type="monotone" dataKey="tasksCompleted" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Activity Section */}
//       <div className="bg-white p-6 rounded-2xl shadow-lg">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
//         <ul className="space-y-4">
//           {tasks.filter(t => t.completed).slice(0, 5).map(task => (
//             <li key={task.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
//               <CircleCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
//               <div className="flex-1">
//                 <p className="font-semibold text-gray-700">{task.title}</p>
//                 <p className="text-sm text-gray-500">{task.description}</p>
//               </div>
//               <p className="text-sm text-gray-400 flex-shrink-0">
//                 {format(new Date(task.createdAt), 'MMM d')}
//               </p>
//             </li>
//           ))}
//         </ul>
//       </div>

//     </div>
//   );
// }


// // -----------------------------------------------------------------------------
// // 4. FocusModeContent Component (Updated for continuous stopwatch functionality)
// // -----------------------------------------------------------------------------
// function FocusModeContent({ activeTask, setTasks, setUserData }) {
//   const [time, setTime] = useState(0); // Represents elapsed time in seconds, starts at 0.
//   const [isRunning, setIsRunning] = useState(false);
//   const [sessionsToday, setSessionsToday] = useState(0);
//   const [lastSessionDay, setLastSessionDay] = useState(getDayOfYear(new Date()));
//   const [message, setMessage] = useState('');
//   const [isMusicPlaying, setIsMusicPlaying] = useState(false);
//   const audioRef = useRef(null);

//   useEffect(() => {
//     const today = getDayOfYear(new Date());
//     if (today !== lastSessionDay) {
//       setSessionsToday(0);
//       setLastSessionDay(today);
//     }
//   }, [lastSessionDay]);

//   // Main timer effect: increments time every second when isRunning is true.
//   useEffect(() => {
//     let interval = null;
//     if (isRunning) {
//       interval = setInterval(() => {
//         setTime(prevTime => prevTime + 1);
//       }, 1000);
//     }
//     return () => clearInterval(interval); // Cleanup on pause or component unmount
//   }, [isRunning]);

//   const handleStartPause = () => {
//     setIsRunning(!isRunning);
//     setMessage(''); // Clear any previous messages when starting or pausing
//   };

//   const handleStopAndSave = () => {
//     setIsRunning(false);

//     // A session is only valid and saved if it lasts for at least one hour (3600 seconds)
//     if (time >= 3600) {
//       if (activeTask) {
//         setTasks(prevTasks => prevTasks.map(task =>
//           task.id === activeTask.id ? { ...task, completed: true } : task
//         ));
//         setUserData(prev => {
//           if (!prev) return null; // Guard against null user data
//           return {
//             ...prev,
//             xp: prev.xp + 10,
//             history: [
//               ...prev.history,
//               {
//                 ...activeTask,
//                 completedAt: new Date().toISOString(),
//                 // Store the actual duration in minutes for consistency with other components
//                 duration: Math.round(time / 60)
//               }
//             ]
//           };
//         });
//       }
//       setSessionsToday(prevCount => prevCount + 1);
//       setMessage(`Session of ${formatTime(time)} saved successfully!`);
//     } else if (time > 0) {
//       // Provide feedback if the session was too short to be saved
//       setMessage('Session was under 1 hour and was not recorded.');
//     }

//     // Reset the timer to 0 after stopping
//     setTime(0);
//   };

//   const toggleMusic = () => {
//     if (isMusicPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play();
//     }
//     setIsMusicPlaying(!isMusicPlaying);
//   };

//   const formatTime = (timeInSeconds) => {
//     const hours = Math.floor(timeInSeconds / 3600);
//     const minutes = Math.floor((timeInSeconds % 3600) / 60);
//     const seconds = timeInSeconds % 60;
//     return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//   };

//   return (
//     <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
//       <audio ref={audioRef} loop src="https://www.dropbox.com/s/xci6pjthkc751e8/Memories%20of%20a%20Friend.mp3?raw=1" />
//       <motion.div
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col items-center space-y-8"
//       >
//         <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
//           Focus Session
//         </h2>

//         {/* Display Timer */}
//         <div className="relative">
//           <motion.div
//             key={time}
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.3 }}
//             className="text-6xl sm:text-7xl font-mono font-extrabold text-blue-600 tracking-wide"
//           >
//             {formatTime(time)}
//           </motion.div>
//           <div className="text-lg text-gray-500 mt-2">
//             Sessions Today: {sessionsToday}
//           </div>
//         </div>
        
//         {/* Message Area */}
//         {message && (
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-indigo-600 font-semibold"
//           >
//             {message}
//           </motion.p>
//         )}

//         {/* Timer Controls */}
//         <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleStartPause}
//             className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md transition-colors duration-200
//               ${isRunning
//                 ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
//                 : 'bg-green-500 hover:bg-green-600 text-white'
//               }`}
//           >
//             {isRunning ? (
//               <>
//                 <Pause size={20} />
//                 <span>Pause</span>
//               </>
//             ) : (
//               <>
//                 <Play size={20} />
//                 <span>Start</span>
//               </>
//             )}
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleStopAndSave}
//             disabled={time === 0 && !isRunning}
//             className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-semibold shadow-md transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
//           >
//             <StopCircle size={20} />
//             <span>Stop & Save</span>
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={toggleMusic}
//             className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 font-semibold shadow-md transition-colors duration-200"
//           >
//             <Music size={20} />
//             <span>{isMusicPlaying ? 'Pause Music' : 'Play Music'}</span>
//           </motion.button>
//         </div>
//       </motion.div>

//       {activeTask && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white p-6 rounded-2xl shadow-lg mt-8 w-full max-w-lg text-left"
//         >
//           <div className="flex items-center space-x-3 mb-2">
//             <LucideFocus className="w-6 h-6 text-blue-500" />
//             <h3 className="text-xl font-semibold text-gray-800">Currently Focusing On</h3>
//           </div>
//           <p className="text-gray-700 font-medium">{activeTask.title}</p>
//           <p className="text-gray-500 text-sm">{activeTask.description}</p>
//         </motion.div>
//       )}
//     </div>
//   );
// }
// // -----------------------------------------------------------------------------
// // Pomodoro Settings Modal (New Component)
// // This modal allows users to set custom times for the Pomodoro cycles.
// // -----------------------------------------------------------------------------
// function PomodoroSettingsModal({ isOpen, onClose, onSubmit, currentSettings }) {
//   const [settings, setSettings] = useState(currentSettings);

//   // Ensure the modal's internal state resets if it's reopened with different props
//   useEffect(() => {
//     setSettings(currentSettings);
//   }, [currentSettings, isOpen]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     // Ensure values are numbers and not negative
//     const numValue = Math.max(1, Number(value));
//     setSettings(prev => ({ ...prev, [name]: numValue }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(settings);
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
//       >
//         <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
//           <X className="w-6 h-6" />
//         </button>
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Custom Pomodoro Times</h2>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="work" className="block text-gray-700 text-sm font-medium mb-1">Work (min)</label>
//               <input type="number" name="work" id="work" value={settings.work} onChange={handleChange} min="1" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"/>
//             </div>
//             <div>
//               <label htmlFor="shortBreak" className="block text-gray-700 text-sm font-medium mb-1">Short Break (min)</label>
//               <input type="number" name="shortBreak" id="shortBreak" value={settings.shortBreak} onChange={handleChange} min="1" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"/>
//             </div>
//             <div>
//               <label htmlFor="longBreak" className="block text-gray-700 text-sm font-medium mb-1">Long Break (min)</label>
//               <input type="number" name="longBreak" id="longBreak" value={settings.longBreak} onChange={handleChange} min="1" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"/>
//             </div>
//             <div>
//               <label htmlFor="sessionsUntilLongBreak" className="block text-gray-700 text-sm font-medium mb-1">Sessions for Long Break</label>
//               <input type="number" name="sessionsUntilLongBreak" id="sessionsUntilLongBreak" value={settings.sessionsUntilLongBreak} onChange={handleChange} min="1" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"/>
//             </div>
//           </div>
//           <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200">
//             Save Settings
//           </motion.button>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// }


// // -----------------------------------------------------------------------------
// // 5. PomodoroContent Component (Updated with Custom Times)
// // -----------------------------------------------------------------------------
// function PomodoroContent({ activeTask, setTasks, setUserData }) {
//   // Settings are now managed by state to allow for customization
//   const [pomodoroSettings, setPomodoroSettings] = useState({
//     work: 25,
//     shortBreak: 5,
//     longBreak: 15,
//     sessionsUntilLongBreak: 4,
//   });

//   const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
//   const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
//   const [time, setTime] = useState(pomodoroSettings.work * 60); // Time in seconds
//   const [isRunning, setIsRunning] = useState(false);
//   const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
//   const [isMusicPlaying, setIsMusicPlaying] = useState(false);
//   const audioRef = useRef(null);

//   // Main timer logic
//   useEffect(() => {
//     if (!isRunning || time <= 0) {
//       if (time <= 0 && isRunning) {
//         setIsRunning(false);
//         handleSessionEnd();
//       }
//       return;
//     }
//     const interval = setInterval(() => setTime(prev => prev - 1), 1000);
//     return () => clearInterval(interval);
//   }, [isRunning, time]);
  
//   // This effect updates the timer if settings are changed while it's paused
//   useEffect(() => {
//     if (!isRunning) {
//         switchMode(mode, pomodoroSettings);
//     }
//   }, [pomodoroSettings]);

//   const handleSessionEnd = () => {
//     if (mode === 'work') {
//       const newCompletedCount = pomodorosCompleted + 1;
//       setPomodorosCompleted(newCompletedCount);
//       if (activeTask) { /* ... (task completion logic) ... */ }
//       if (newCompletedCount % pomodoroSettings.sessionsUntilLongBreak === 0) {
//         switchMode('longBreak');
//       } else {
//         switchMode('shortBreak');
//       }
//     } else {
//       switchMode('work');
//     }
//   };

//   const switchMode = (newMode, currentSettings = pomodoroSettings) => {
//     setMode(newMode);
//     setIsRunning(false);
//     setTime(currentSettings[newMode] * 60);
//   };
  
//   const handleSaveSettings = (newSettings) => {
//     setPomodoroSettings(newSettings);
//     // If the timer is not running, immediately reflect the new time for the current mode
//     if (!isRunning) {
//         switchMode(mode, newSettings);
//     }
//     setIsSettingsModalOpen(false);
//   };

//   const toggleTimer = () => setIsRunning(!isRunning);
//   const toggleMusic = () => { /* ... (music logic) ... */ };
//   const formatTime = (seconds) => {
//     return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
//   };
//   const getModeButtonClass = (buttonMode) => mode === buttonMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

//   return (
//     <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
//       <audio ref={audioRef} loop src="https://www.dropbox.com/s/xci6pjthkc751e8/Memories%20of%20a%20Friend.mp3?raw=1" />
//       <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
//         className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col items-center space-y-8">
        
//         <div className="w-full flex justify-between items-center">
//             <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Pomodoro Timer</h2>
//             <motion.button 
//                 whileHover={{ scale: 1.1, rotate: 15 }} 
//                 whileTap={{ scale: 0.9 }} 
//                 onClick={() => setIsSettingsModalOpen(true)}
//                 className="text-gray-500 hover:text-blue-600 p-2 rounded-full"
//                 title="Custom Times"
//             >
//                 <Settings size={24} />
//             </motion.button>
//         </div>

//         <div className="flex space-x-2 sm:space-x-4">
//           <button onClick={() => switchMode('work')} className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${getModeButtonClass('work')}`}>
//             Work ({pomodoroSettings.work} min)
//           </button>
//           <button onClick={() => switchMode('shortBreak')} className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${getModeButtonClass('shortBreak')}`}>
//             Short Break ({pomodoroSettings.shortBreak} min)
//           </button>
//           <button onClick={() => switchMode('longBreak')} className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${getModeButtonClass('longBreak')}`}>
//             Long Break ({pomodoroSettings.longBreak} min)
//           </button>
//         </div>

//         <motion.div key={time} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
//             className="text-6xl sm:text-8xl font-mono font-extrabold text-blue-600 tracking-wide">
//             {formatTime(time)}
//         </motion.div>
        
//         <p className="text-gray-500 font-medium">Completed Pomodoros: <span className="font-bold text-gray-700">{pomodorosCompleted}</span></p>

//         <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
//           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleTimer}
//             className={`w-full text-2xl flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold shadow-lg transition-all duration-200 ${isRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
//             {isRunning ? <Pause size={28} /> : <Play size={28} />}
//             <span>{isRunning ? 'PAUSE' : 'START'}</span>
//           </motion.button>
//           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMusic}
//             className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 font-semibold shadow-md transition-colors duration-200">
//             <Music size={20} />
//             <span>{isMusicPlaying ? 'Pause Music' : 'Play Music'}</span>
//           </motion.button>
//         </div>
//       </motion.div>

//       <PomodoroSettingsModal
//         isOpen={isSettingsModalOpen}
//         onClose={() => setIsSettingsModalOpen(false)}
//         onSubmit={handleSaveSettings}
//         currentSettings={pomodoroSettings}
//       />

//       {activeTask && (
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//           className="bg-white p-6 rounded-2xl shadow-lg mt-8 w-full max-w-lg text-left">
//           {/* ... active task display ... */}
//         </motion.div>
//       )}
//     </div>
//   );
// }

// // -----------------------------------------------------------------------------
// // 6. TaskCard, TaskModal, TasksPage
// // -----------------------------------------------------------------------------
// function TaskCard({ task, index, onStart, onEdit, onDelete, onToggleComplete }) {
//   const priorityColors = {
//     high: 'text-red-500',
//     medium: 'text-yellow-500',
//     low: 'text-green-500',
//   };

//   const energyColors = {
//     High: 'text-blue-500',
//     Medium: 'text-orange-500',
//     Low: 'text-teal-500',
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.3, delay: index * 0.05 }}
//       className={`relative bg-white rounded-2xl shadow-lg p-6 border ${task.completed ? 'border-green-300' : 'border-gray-200'} hover:border-blue-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1`}
//     >
//       <div className="flex justify-between items-start mb-4">
//         <h3 className={`text-lg sm:text-xl font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
//           {task.title}
//         </h3>
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => onToggleComplete(task)}
//           className={`w-6 h-6 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center transition-all duration-200`}
//         >
//           {task.completed && (
//             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//             </svg>
//           )}
//         </motion.button>
//       </div>

//       <p className={`text-sm sm:text-base text-gray-500 mb-4 ${task.completed ? 'line-through' : ''}`}>
//         {task.description}
//       </p>

//       <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm mb-4">
//         <div className="flex items-center text-gray-500">
//           <Clock className="w-4 h-4 mr-2" />
//           <span>{task.duration} min</span>
//         </div>
//         <div className="flex items-center text-gray-500">
//           <Zap className={`w-4 h-4 mr-2 ${energyColors[task.energy]}`} />
//           <span>{task.energy} Energy</span>
//         </div>
//         <div className="flex items-center text-gray-500">
//           <Calendar className="w-4 h-4 mr-2" />
//           <span>{format(new Date(task.date), 'MMM dd')}</span>
//         </div>
//         <div className="flex items-center text-gray-500">
//           <span className={`w-2 h-2 rounded-full mr-2 ${priorityColors[task.priority] === 'text-red-500' ? 'bg-red-500' : priorityColors[task.priority] === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
//           <span>{task.priority} Priority</span>
//         </div>
//       </div>

//       <div className="flex justify-end space-x-2 mt-4">
//         {!task.completed && (
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => onStart(task)}
//             className="flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg"
//             title="Start Task"
//           >
//             <Play className="w-5 h-5" />
//           </motion.button>
//         )}
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => onEdit(task)}
//           className="flex items-center text-yellow-500 hover:text-yellow-600 transition-colors duration-200 p-2 rounded-lg"
//           title="Edit Task"
//         >
//           <Edit className="w-5 h-5" />
//         </motion.button>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => onDelete(task.id)}
//           className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg"
//           title="Delete Task"
//         >
//           <Trash2 className="w-5 h-5" />
//         </motion.button>
//       </div>
//     </motion.div>
//   );
// }

// function TaskModal({ isOpen, onClose, onSubmit, editingTask }) {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [duration, setDuration] = useState(30);
//   const [energy, setEnergy] = useState('Medium');
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [priority, setPriority] = useState('medium');

//   useEffect(() => {
//     if (editingTask) {
//       setTitle(editingTask.title);
//       setDescription(editingTask.description);
//       setDuration(editingTask.duration);
//       setEnergy(editingTask.energy);
//       setDate(editingTask.date);
//       setPriority(editingTask.priority);
//     } else {
//       setTitle('');
//       setDescription('');
//       setDuration(30);
//       setEnergy('Medium');
//       setDate(new Date().toISOString().split('T')[0]);
//       setPriority('medium');
//     }
//   }, [editingTask, isOpen]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit({ title, description, duration: Number(duration), energy, date, priority });
//   };

//   if (!isOpen) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//         >
//           <X className="w-6 h-6" />
//         </button>
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           {editingTask ? 'Edit Task' : 'Add New Task'}
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-1">Title</label>
//             <input
//               type="text"
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-1">Description</label>
//             <textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
//               rows="3"
//             ></textarea>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="duration" className="block text-gray-700 text-sm font-medium mb-1">Duration (min)</label>
//               <input
//                 type="number"
//                 id="duration"
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 min="5"
//                 step="5"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="energy" className="block text-gray-700 text-sm font-medium mb-1">Energy Required</label>
//               <select
//                 id="energy"
//                 value={energy}
//                 onChange={(e) => setEnergy(e.target.value)}
//                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               >
//                 <option value="Low">Low</option>
//                 <option value="Medium">Medium</option>
//                 <option value="High">High</option>
//               </select>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="date" className="block text-gray-700 text-sm font-medium mb-1">Due Date</label>
//               <input
//                 type="date"
//                 id="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="priority" className="block text-gray-700 text-sm font-medium mb-1">Priority</label>
//               <select
//                 id="priority"
//                 value={priority}
//                 onChange={(e) => setPriority(e.target.value)}
//                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//               </select>
//             </div>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
//           >
//             {editingTask ? 'Save Changes' : 'Add Task'}
//           </motion.button>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// }

// function StartTaskModal({ isOpen, onClose, onSelectMode }) {
//   if (!isOpen) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//         >
//           <X className="w-6 h-6" />
//         </button>
//         <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//           Choose Your Focus Mode
//         </h2>
//         <div className="flex flex-col space-y-4">
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => onSelectMode('focus')}
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
//           >
//             <LucideFocus className="w-6 h-6" />
//             <span>Focus Mode</span>
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => onSelectMode('pomodoro')}
//             className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
//           >
//             <Timer className="w-6 h-6" />
//             <span>Pomodoro Technique</span>
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// function TasksPage({ tasks, setTasks, onPlayTask, productivityLevel, setUserData }) {
//   const [filteredTasks, setFilteredTasks] = useState(tasks);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isStartModalOpen, setIsStartModalOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [taskToStart, setTaskToStart] = useState(null);
//   const [filters, setFilters] = useState({
//     status: 'all',
//     search: '',
//     date: new Date().toISOString().split('T')[0]
//   });

//   useEffect(() => {
//     let filtered = tasks;

//     if (productivityLevel) {
//       filtered = filtered.filter(task => task.energy.toLowerCase() === productivityLevel.toLowerCase());
//     }

//     if (filters.status !== 'all') {
//       if (filters.status === 'completed') {
//         filtered = filtered.filter(task => task.completed);
//       } else {
//         filtered = filtered.filter(task => !task.completed);
//       }
//     }

//     if (filters.search) {
//       filtered = filtered.filter(task =>
//         task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//         task.description.toLowerCase().includes(filters.search.toLowerCase())
//       );
//     }

//     if (filters.date) {
//       filtered = filtered.filter(task => task.date === filters.date);
//     }

//     setFilteredTasks(filtered);
//   }, [tasks, filters, productivityLevel]);

//   const handleAddTask = (taskData) => {
//     const newTask = {
//       id: Date.now(),
//       ...taskData,
//       completed: false,
//       postponedCount: 0,
//       createdAt: new Date().toISOString()
//     };
//     setTasks([...tasks, newTask]);
//     setIsModalOpen(false);
//   };

//   const handleEditTask = (taskData) => {
//     setTasks(tasks.map(task =>
//       task.id === editingTask.id ? { ...task, ...taskData } : task
//     ));
//     setEditingTask(null);
//     setIsModalOpen(false);
//   };

//   const handleDeleteTask = (taskId) => {
//     setTasks(tasks.filter(task => task.id !== taskId));
//   };

//   const handleToggleComplete = (task) => {
//     const isCompleting = !task.completed;
//     setTasks(tasks.map(t =>
//       t.id === task.id ? { ...t, completed: !t.completed } : t
//     ));
//     if (isCompleting) {
//       setUserData(prev => ({
//         ...prev,
//         xp: prev.xp + 10,
//         history: [...prev.history, { ...task, completedAt: new Date().toISOString() }]
//       }));
//     }
//   };

//   const openEditModal = (task) => {
//     setEditingTask(task);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingTask(null);
//   };

//   const openStartModal = (task) => {
//     setTaskToStart(task);
//     setIsStartModalOpen(true);
//   };

//   const closeStartModal = () => {
//     setIsStartModalOpen(false);
//     setTaskToStart(null);
//   };

//   const handleModeSelection = (mode) => {
//     onPlayTask(mode, taskToStart);
//     closeStartModal();
//   };

//   const tasksForDay = tasks.filter(task => task.date === filters.date && (!productivityLevel || task.energy.toLowerCase() === productivityLevel.toLowerCase()));
//   const completedTasks = tasksForDay.filter(task => task.completed).length;
//   const totalTasks = tasksForDay.length;

//   return (
//     <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
//                 Task Manager
//               </h1>
//               <p className="text-gray-500 mt-2">
//                 {format(new Date(filters.date), 'EEEE, MMMM do, yyyy')} • {completedTasks}/{totalTasks} completed
//               </p>
//             </div>
            
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setIsModalOpen(true)}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium flex items-center space-x-2 shadow-md w-full sm:w-auto justify-center"
//             >
//               <Plus className="w-5 h-5" />
//               <span>Add Task</span>
//             </motion.button>
//           </div>

//           <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search tasks..."
//                   value={filters.search}
//                   onChange={(e) => setFilters({...filters, search: e.target.value})}
//                   className="w-full bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <select
//                 value={filters.status}
//                 onChange={(e) => setFilters({...filters, status: e.target.value})}
//                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="all">All Tasks</option>
//                 <option value="pending">Pending</option>
//                 <option value="completed">Completed</option>
//               </select>

//               <input
//                 type="date"
//                 value={filters.date || ''}
//                 onChange={(e) => setFilters({...filters, date: e.target.value})}
//                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//         </div>

//         <AnimatePresence>
//           {filteredTasks.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center py-8 sm:py-16"
//             >
//               <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
//                 <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks for this day</h3>
//               <p className="text-gray-500 mb-6">Try adjusting your filters or create a new task</p>
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
//               >
//                 Create First Task
//               </button>
//             </motion.div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredTasks.map((task, index) => (
//                 <TaskCard
//                   key={task.id}
//                   task={task}
//                   index={index}
//                   onStart={openStartModal}
//                   onEdit={openEditModal}
//                   onDelete={handleDeleteTask}
//                   onToggleComplete={() => handleToggleComplete(task)}
//                 />
//               ))}
//             </div>
//           )}
//         </AnimatePresence>

//         <TaskModal
//           isOpen={isModalOpen}
//           onClose={closeModal}
//           onSubmit={editingTask ? handleEditTask : handleAddTask}
//           editingTask={editingTask}
//         />
//         <StartTaskModal
//           isOpen={isStartModalOpen}
//           onClose={closeStartModal}
//           onSelectMode={handleModeSelection}
//         />
//       </div>
//     </div>
//   );
// }

// // -----------------------------------------------------------------------------
// // Productivity Modal
// // -----------------------------------------------------------------------------
// function ProductivityModal({ isOpen, onSubmit }) {
//   const [level, setLevel] = useState('Medium');

//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(level);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
//       >
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           What's your current productivity level?
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <select
//             value={level}
//             onChange={(e) => setLevel(e.target.value)}
//             className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             required
//           >
//             <option value="High">High</option>
//             <option value="Medium">Medium</option>
//             <option value="Low">Low</option>
//           </select>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
//           >
//             Submit
//           </motion.button>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// }

// // -----------------------------------------------------------------------------
// // Welcome Modal for first time users
// // -----------------------------------------------------------------------------
// function WelcomeModal({ isOpen, onSubmit }) {
//   const [name, setName] = useState('');
//   const [purpose, setPurpose] = useState('');
//   const [source, setSource] = useState('');
//   const [schedule, setSchedule] = useState('');

//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit({ name, purpose, source, schedule });
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
//       >
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           Welcome to Focus App!
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">Your Name</label>
//             <input
//               type="text"
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="purpose" className="block text-gray-700 text-sm font-medium mb-1">What do you need this app for?</label>
//             <textarea
//               id="purpose"
//               value={purpose}
//               onChange={(e) => setPurpose(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 min-h-[60px]"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="source" className="block text-gray-700 text-sm font-medium mb-1">Where did you hear about this app?</label>
//             <input
//               type="text"
//               id="source"
//               value={source}
//               onChange={(e) => setSource(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="schedule" className="block text-gray-700 text-sm font-medium mb-1">What's your daily schedule?</label>
//             <textarea
//               id="schedule"
//               value={schedule}
//               onChange={(e) => setSchedule(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 min-h-[100px]"
//               required
//             />
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
//           >
//             Get Started
//           </motion.button>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// }

// // -----------------------------------------------------------------------------
// // SidebarItem
// // -----------------------------------------------------------------------------
// const SidebarItem = ({ icon, text, isActive, onClick, isCollapsed }) => (
//   <button
//     onClick={onClick}
//     className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200
//       ${isActive
//         ? 'bg-blue-500 text-white shadow-md'
//         : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
//       }
//       ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'}
//     `}
//     title={isCollapsed ? text : ''}
//   >
//     <span>{icon}</span>
//     <AnimatePresence>
//       {!isCollapsed && (
//         <motion.span
//           initial={{ opacity: 0, x: -10 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -10 }}
//           transition={{ duration: 0.2 }}
//           className="font-medium whitespace-nowrap"
//         >
//           {text}
//         </motion.span>
//       )}
//     </AnimatePresence>
//   </button>
// );

// // -----------------------------------------------------------------------------
// // Settings Content
// // -----------------------------------------------------------------------------
// const SettingsContent = ({ userData, setUserData }) => (
//   <div className="bg-white p-6 rounded-2xl shadow-lg">
//     <h2 className="text-3xl font-bold text-gray-800 mb-4">Settings</h2>
//     <p className="text-gray-600 mb-4">
//       Manage your app preferences here.
//     </p>
//     {/* Add settings options, e.g. theme, notifications */}
//     <div className="space-y-4">
//       <div>
//         <label className="block text-gray-700">Theme</label>
//         <select className="w-full bg-gray-100 border rounded-lg p-2">
//           <option>Light</option>
//           <option>Dark</option>
//         </select>
//       </div>
//       {/* More settings */}
//     </div>
//   </div>
// );

// // -----------------------------------------------------------------------------
// // Profile Content
// // -----------------------------------------------------------------------------
// const ProfileContent = ({ userData, setUserData, setTasks, setProductivityLevel, setShowProductivityModal, setShowWelcomeModal }) => {
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState(userData || {});

//   useEffect(() => {
//     setFormData(userData || {});
//   }, [userData]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSave = () => {
//     setUserData(formData);
//     setEditMode(false);
//   };

//   const handleResetData = () => {
//     localStorage.clear();
//     setTasks([]);
//     setProductivityLevel(null);
//     setUserData(null);
//     setShowProductivityModal(true);
//     setShowWelcomeModal(true);
//     alert('All app data has been reset to default.');
//   };

//   if (!userData) return null;

//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-lg">
//       <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>
//       {editMode ? (
//         <div className="space-y-4">
//           <div>
//             <label className="block text-gray-700">Name</label>
//             <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Avatar URL</label>
//             <input name="avatar" value={formData.avatar} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Description</label>
//             <textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Purpose</label>
//             <textarea name="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Source</label>
//             <input name="source" value={formData.source} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Schedule</label>
//             <textarea name="schedule" value={formData.schedule} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded">Save</button>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {formData.avatar && <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full" />}
//           <p><strong>Name:</strong> {formData.name}</p>
//           <p><strong>Description:</strong> {formData.desc}</p>
//           <p><strong>Purpose:</strong> {formData.purpose}</p>
//           <p><strong>Source:</strong> {formData.source}</p>
//           <p><strong>Schedule:</strong> {formData.schedule}</p>
//           <p><strong>XP:</strong> {formData.xp}</p>
//           <button onClick={() => setEditMode(true)} className="bg-yellow-500 text-white py-2 px-4 rounded">Edit</button>
//         </div>
//       )}
//       <h3 className="text-2xl font-bold mt-8 mb-4">Task History</h3>
//       <ul className="space-y-2">
//         {formData.history?.map((item, index) => (
//           <li key={index} className="bg-gray-100 p-2 rounded">
//             {item.title} - Completed on {format(new Date(item.completedAt), 'MMM d, yyyy HH:mm')}
//           </li>
//         ))}
//       </ul>
//       <button
//         onClick={handleResetData}
//         className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-200 mt-8"
//       >
//         Reset All App Data
//       </button>
//     </div>
//   );
// };

// // -----------------------------------------------------------------------------
// // AI Assistant Placeholder
// // -----------------------------------------------------------------------------
// const AIAssistantContent = () => (
//   <div className="bg-white p-6 rounded-2xl shadow-lg">
//     <h2 className="text-3xl font-bold text-gray-800 mb-4">AI Assistant</h2>
//     <p className="text-gray-600">
//       Coming soon! This will be an AI-powered assistant to help with task suggestions, productivity tips, and more.
//     </p>
//   </div>
// );

// export default App;

// completed this code from the previous parts


// "use client"
// import React, { useState, useEffect, useRef } from 'react';
// import { LayoutDashboard, Timer, LucideFocus, Settings, User, Menu, X, CircleCheck, ListTodo, Plus, Search, Calendar, Clock, Zap, Play, Edit, Trash2, TrendingUp, TrendingDown, RefreshCw, Pause, StopCircle, Bot, Music } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { format, subDays, getDayOfYear, isSameDay } from 'date-fns';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// // -----------------------------------------------------------------------------
// // 1. Main App Component
// //    This is the main container for the entire application.
// // -----------------------------------------------------------------------------
// function App() {
//   // State to track which section is currently active (e.g., 'dashboard', 'tasks').
//   const [activeSection, setActiveSection] = useState('tasks');
//   // State to control the mobile sidebar's visibility.
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   // State to control the desktop sidebar's collapsed state.
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   // State to track the currently selected task for the timer.
//   const [activeTask, setActiveTask] = useState(null);

//   // Tasks state
//   const [tasks, setTasks] = useState([]);

//   // Productivity level
//   const [productivityLevel, setProductivityLevel] = useState(null);

//   // User data
//   const [userData, setUserData] = useState(null);

//   // Modals
//   const [showProductivityModal, setShowProductivityModal] = useState(false);
//   const [showWelcomeModal, setShowWelcomeModal] = useState(false);

//   // Load data from localStorage on client side
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Load tasks
//       const storedTasks = localStorage.getItem('focus-app-tasks');
//       if (storedTasks) {
//         setTasks(JSON.parse(storedTasks));
//       }

//       // Load user data
//       const storedUser = localStorage.getItem('focus-app-user');
//       if (storedUser) {
//         setUserData(JSON.parse(storedUser));
//       } else {
//         setShowWelcomeModal(true);
//       }

//       // Always show productivity modal
//       setShowProductivityModal(true);
//     }
//   }, []);

//   // Save tasks to localStorage
//   useEffect(() => {
//     if (typeof window !== 'undefined' && tasks.length > 0) {
//       localStorage.setItem('focus-app-tasks', JSON.stringify(tasks));
//     }
//   }, [tasks]);

//   // Save user data
//   useEffect(() => {
//     if (typeof window !== 'undefined' && userData) {
//       localStorage.setItem('focus-app-user', JSON.stringify(userData));
//     }
//   }, [userData]);

//   // Handler to change the active section.
//   const handleSectionChange = (section, task = null) => {
//     setActiveSection(section);
//     setActiveTask(task);
//     setIsSidebarOpen(false); // Close sidebar on mobile
//   };

//   // Helper function to render the correct content based on the active section.
//   const renderContent = () => {
//     switch (activeSection) {
//       case 'dashboard':
//         return <DashboardContent tasks={tasks} userData={userData} />;
//       case 'focus':
//         return <FocusModeContent activeTask={activeTask} setTasks={setTasks} setUserData={setUserData} />;
//       case 'pomodoro':
//         return <PomodoroContent activeTask={activeTask} setTasks={setTasks} setUserData={setUserData} />;
//       case 'tasks':
//         return <TasksPage tasks={tasks} setTasks={setTasks} onPlayTask={handleSectionChange} productivityLevel={productivityLevel} setUserData={setUserData} />;
//       case 'settings':
//         return <SettingsContent userData={userData} setUserData={setUserData} />;
//       case 'profile':
//         return <ProfileContent userData={userData} setUserData={setUserData} setTasks={setTasks} setProductivityLevel={setProductivityLevel} setShowProductivityModal={setShowProductivityModal} setShowWelcomeModal={setShowWelcomeModal} />;
//       case 'ai':
//         return <AIAssistantContent />;
//       default:
//         return <DashboardContent tasks={tasks} userData={userData} />;
//     }
//   };

//   const handleSetProductivity = (level) => {
//     setProductivityLevel(level);
//     setShowProductivityModal(false);
//   };

//   const handleSetUserInfo = (info) => {
//     setUserData({
//       ...info,
//       xp: 0,
//       avatar: '',
//       desc: '',
//       history: []
//     });
//     setShowWelcomeModal(false);
//   };

//   return (
//     <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans text-gray-800">

//       {/* Mobile menu button */}
//       <div className="md:hidden p-4 flex justify-between items-center bg-white shadow-md">
//         <h1 className="text-xl font-bold text-gray-800">Focus App</h1>
//         <button
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//           className="p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
//         >
//           {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>

//       {/* Mobile menu overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Sidebar Component */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
//         bg-white shadow-lg p-6 flex flex-col space-y-4
//         ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
//         ${isCollapsed ? 'md:w-20' : 'md:w-64'}
//         md:relative md:translate-x-0 md:p-4`}
//       >
//         <div className="flex justify-between items-center flex-shrink-0 mb-8">
//           {/* Main App Title, only visible when not collapsed */}
//           {!isCollapsed && (
//             <h1 className="text-3xl font-bold text-gray-800 tracking-tight transition-opacity duration-300">Focus App</h1>
//           )}
//           {/* Hamburger/Collapse button for desktop and close for mobile */}
//           <button
//             onClick={() => {
//               // On desktop, toggle the collapsed state
//               if (window.innerWidth >= 768) {
//                 setIsCollapsed(!isCollapsed);
//               } else {
//                 // On mobile, toggle the sidebar's open state
//                 setIsSidebarOpen(!isSidebarOpen);
//               }
//             }}
//             className={`p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
//           >
//             {isCollapsed ? <Menu size={24} /> : <X size={24} />}
//           </button>
//         </div>
//         {/* Navigation links */}
//         <nav className="flex-1 space-y-2">
//           <SidebarItem
//             icon={<LayoutDashboard size={20} />}
//             text="Dashboard"
//             isActive={activeSection === 'dashboard'}
//             onClick={() => handleSectionChange('dashboard')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<LucideFocus size={20} />}
//             text="Focus Mode"
//             isActive={activeSection === 'focus'}
//             onClick={() => handleSectionChange('focus')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<Timer size={20} />}
//             text="Pomodoro"
//             isActive={activeSection === 'pomodoro'}
//             onClick={() => handleSectionChange('pomodoro')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<ListTodo size={20} />}
//             text="Task Manager"
//             isActive={activeSection === 'tasks'}
//             onClick={() => handleSectionChange('tasks')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<Bot size={20} />}
//             text="AI Assistant"
//             isActive={activeSection === 'ai'}
//             onClick={() => handleSectionChange('ai')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<Settings size={20} />}
//             text="Settings"
//             isActive={activeSection === 'settings'}
//             onClick={() => handleSectionChange('settings')}
//             isCollapsed={isCollapsed}
//           />
//           <SidebarItem
//             icon={<User size={20} />}
//             text="Profile"
//             isActive={activeSection === 'profile'}
//             onClick={() => handleSectionChange('profile')}
//             isCollapsed={isCollapsed}
//           />
//         </nav>
//       </aside>

//       {/* Main content area */}
//       <main className="flex-1 flex flex-col overflow-y-auto">
//         <div className="p-4 sm:p-6 lg:p-8">
//           {renderContent()}
//         </div>
//       </main>

//       <ProductivityModal
//         isOpen={showProductivityModal}
//         onSubmit={handleSetProductivity}
//       />

//       <WelcomeModal
//         isOpen={showWelcomeModal}
//         onSubmit={handleSetUserInfo}
//       />

//     </div>
//   );
// }

// // -----------------------------------------------------------------------------
// // 3. DashboardContent Component
// // -----------------------------------------------------------------------------
// function DashboardContent({ tasks, userData }) {
//   const completedTasksCount = tasks.filter(task => task.completed).length;
//   const totalTasksToday = tasks.filter(task => task.date === new Date().toISOString().split('T')[0]).length;
//   const tasksDueToday = tasks.filter(task => task.date === new Date().toISOString().split('T')[0] && !task.completed).length;
//   const totalFocusTime = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.duration, 0);

//   // Data for the task completion chart
//   const weeklyData = [
//     { name: format(subDays(new Date(), 6), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 6))).length },
//     { name: format(subDays(new Date(), 5), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 5))).length },
//     { name: format(subDays(new Date(), 4), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 4))).length },
//     { name: format(subDays(new Date(), 3), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 3))).length },
//     { name: format(subDays(new Date(), 2), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 2))).length },
//     { name: format(subDays(new Date(), 1), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 1))).length },
//     { name: format(new Date(), 'E'), tasksCompleted: tasks.filter(t => isSameDay(new Date(t.createdAt), new Date())).length },
//   ];

//   return (
//     <div className="p-4 sm:p-6 lg:p-8">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
//       {/* Metric Cards Section */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Completed Tasks</p>
//             <h2 className="text-3xl font-bold text-gray-800">{completedTasksCount}</h2>
//           </div>
//           <CircleCheck className="w-10 h-10 text-green-500" />
//         </div>
        
//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Total Focus Time</p>
//             <h2 className="text-3xl font-bold text-gray-800">{totalFocusTime} <span className="text-base text-gray-500">min</span></h2>
//           </div>
//           <Clock className="w-10 h-10 text-blue-500" />
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Tasks Due Today</p>
//             <h2 className="text-3xl font-bold text-gray-800">{tasksDueToday}</h2>
//           </div>
//           <ListTodo className="w-10 h-10 text-yellow-500" />
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Postponed</p>
//             <h2 className="text-3xl font-bold text-gray-800">{tasks.filter(t => t.postponedCount > 0).length}</h2>
//           </div>
//           <TrendingDown className="w-10 h-10 text-red-500" />
//         </div>
//       </div>

//       {/* Graphs and Charts Section */}
//       <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Task Completion</h2>
//         <div className="w-full h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={weeklyData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis dataKey="name" tickLine={false} axisLine={false} />
//               <YAxis tickLine={false} axisLine={false} />
//               <Tooltip
//                 contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
//                 labelStyle={{ fontWeight: 'bold' }}
//                 itemStyle={{ color: '#1f2937' }}
//                 formatter={(value) => [`${value} tasks`, 'Completed']}
//               />
//               <Line type="monotone" dataKey="tasksCompleted" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Activity Section */}
//       <div className="bg-white p-6 rounded-2xl shadow-lg">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
//         <ul className="space-y-4">
//           {tasks.filter(t => t.completed).slice(0, 5).map(task => (
//             <li key={task.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
//               <CircleCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
//               <div className="flex-1">
//                 <p className="font-semibold text-gray-700">{task.title}</p>
//                 <p className="text-sm text-gray-500">{task.description}</p>
//               </div>
//               <p className="text-sm text-gray-400 flex-shrink-0">
//                 {format(new Date(task.createdAt), 'MMM d')}
//               </p>
//             </li>
//           ))}
//         </ul>
//       </div>

//     </div>
//   );
// }

// // -----------------------------------------------------------------------------
// // 4. FocusModeContent Component (Updated with music)
// // -----------------------------------------------------------------------------
// function FocusModeContent({ activeTask, setTasks, setUserData }) {
//   const [hours, setHours] = useState(activeTask?.duration ? Math.floor(activeTask.duration / 60) : 0);
//   const [minutes, setMinutes] = useState(activeTask?.duration ? (activeTask.duration % 60) : 30);
//   const [time, setTime] = useState(activeTask?.duration ? activeTask.duration * 60 : 30 * 60);
//   const [isRunning, setIsRunning] = useState(false);
//   const [sessionsToday, setSessionsToday] = useState(0);
//   const [lastSessionDay, setLastSessionDay] = useState(getDayOfYear(new Date()));
//   const [message, setMessage] = useState('');
//   const [isMusicPlaying, setIsMusicPlaying] = useState(false);
//   const audioRef = useRef(null);

//   useEffect(() => {
//     const today = getDayOfYear(new Date());
//     if (today !== lastSessionDay) {
//       setSessionsToday(0);
//       setLastSessionDay(today);
//     }
//   }, [lastSessionDay]);

//   useEffect(() => {
//     setTime((hours * 60 * 60) + (minutes * 60));
//   }, [hours, minutes]);

//   useEffect(() => {
//     let interval = null;
//     if (isRunning) {
//       interval = setInterval(() => {
//         setTime(prevTime => {
//           if (prevTime <= 1) {
//             setIsRunning(false);
//             if (activeTask) {
//               setTasks(prevTasks => prevTasks.map(task => 
//                 task.id === activeTask.id ? { ...task, completed: true } : task
//               ));
//               setUserData(prev => ({
//                 ...prev,
//                 xp: prev.xp + 10,
//                 history: [...prev.history, { ...activeTask, completedAt: new Date().toISOString() }]
//               }));
//             }
//             setSessionsToday(prevCount => prevCount + 1);
//             return 0;
//           }
//           return prevTime - 1;
//         });
//       }, 1000);
//     } else if (!isRunning && time !== 0) {
//       clearInterval(interval);
//     }
//     return () => clearInterval(interval);
//   }, [isRunning, time, activeTask, setTasks, setUserData]);

//   const toggleTimer = () => {
//     const totalMinutes = (hours * 60) + minutes;
//     if (totalMinutes < 60) {
//       setMessage('Focus session must be at least 60 minutes.');
//       setIsRunning(false);
//       return;
//     }

//     setMessage('');
//     setIsRunning(!isRunning);
//   };

//   const resetTimer = () => {
//     setIsRunning(false);
//     setHours(activeTask?.duration ? Math.floor(activeTask.duration / 60) : 0);
//     setMinutes(activeTask?.duration ? (activeTask.duration % 60) : 30);
//     setTime(activeTask?.duration ? activeTask.duration * 60 : 30 * 60);
//     setMessage('');
//   };

//   const continueSession = () => {
//     setIsRunning(true);
//     setHours(1);
//     setMinutes(0);
//   };

//   const toggleMusic = () => {
//     if (isMusicPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play();
//     }
//     setIsMusicPlaying(!isMusicPlaying);
//   };

//   const formatTime = (timeInSeconds) => {
//     const totalMinutes = Math.floor(timeInSeconds / 60);
//     const displayMinutes = totalMinutes % 60;
//     const displayHours = Math.floor(totalMinutes / 60);
//     const displaySeconds = timeInSeconds % 60;
//     return `${displayHours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
//   };

//   const isDisabled = isRunning || !!activeTask;

//   return (
//     <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
//       <audio ref={audioRef} loop src="https://www.dropbox.com/s/xci6pjthkc751e8/Memories%20of%20a%20Friend.mp3?raw=1" />
//       <motion.div
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col items-center space-y-8"
//       >
//         <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
//           Focus Session
//         </h2>

//         {/* Display Timer */}
//         <div className="relative">
//           <motion.div
//             key={time}
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.3 }}
//             className="text-6xl sm:text-7xl font-mono font-extrabold text-blue-600 tracking-wide"
//           >
//             {formatTime(time)}
//           </motion.div>
//           <div className="text-lg text-gray-500 mt-2">
//             Session {sessionsToday + 1}
//           </div>
//         </div>

//         {/* Time Input */}
//         <div className="flex items-center space-x-2">
//           <select
//             value={hours}
//             onChange={(e) => setHours(parseInt(e.target.value))}
//             className="w-20 text-center text-xl rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
//             disabled={isDisabled}
//           >
//             {Array.from({ length: 4 }, (_, i) => i + 1).map(h => (
//               <option key={h} value={h}>{h}</option>
//             ))}
//           </select>
//           <span className="text-base font-medium text-gray-700">hours</span>
//           <select
//             value={minutes}
//             onChange={(e) => setMinutes(parseInt(e.target.value))}
//             className="w-20 text-center text-xl rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
//             disabled={isDisabled}
//           >
//             {Array.from({ length: 60 }, (_, i) => i).map(m => (
//               <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
//             ))}
//           </select>
//           <span className="text-base font-medium text-gray-700">min</span>
//         </div>
        
//         {/* Message Area */}
//         {message && (
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-red-500 font-semibold"
//           >
//             {message}
//           </motion.p>
//         )}

//         {/* Timer Controls */}
//         <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={toggleTimer}
//             className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md transition-colors duration-200
//               ${isRunning
//                 ? 'bg-red-500 hover:bg-red-600 text-white'
//                 : 'bg-green-500 hover:bg-green-600 text-white'
//               }`}
//           >
//             {isRunning ? (
//               <>
//                 <Zap size={20} />
//                 <span>Pause</span>
//               </>
//             ) : (
//               <>
//                 <Play size={20} />
//                 <span>Start</span>
//               </>
//             )}
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={resetTimer}
//             className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold shadow-md transition-colors duration-200"
//           >
//             <RefreshCw size={20} />
//             <span>Reset</span>
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={toggleMusic}
//             className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 font-semibold shadow-md transition-colors duration-200"
//           >
//             <Music size={20} />
//             <span>{isMusicPlaying ? 'Pause Music' : 'Play Music'}</span>
//           </motion.button>
//         </div>
//         {time === 0 && (
//           <motion.button
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={continueSession}
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-colors duration-200 mt-4"
//           >
//             Continue Session
//           </motion.button>
//         )}
//       </motion.div>
//       <div className="mt-6 text-lg font-medium text-gray-600">
//         Sessions Completed Today: <span className="text-blue-500 font-bold">{sessionsToday}</span>
//       </div>

//       {activeTask && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white p-6 rounded-2xl shadow-lg mt-8 w-full max-w-lg text-left"
//         >
//           <div className="flex items-center space-x-3 mb-2">
//             <LucideFocus className="w-6 h-6 text-blue-500" />
//             <h3 className="text-xl font-semibold text-gray-800">Currently Focused On</h3>
//           </div>
//           <p className="text-gray-700 font-medium">{activeTask.title}</p>
//           <p className="text-gray-500 text-sm">{activeTask.description}</p>
//         </motion.div>
//       )}
//     </div>
//   );
// }

// // -----------------------------------------------------------------------------
// // 5. PomodoroContent Component (Updated with music)
// // -----------------------------------------------------------------------------
// function PomodoroContent({ activeTask, setTasks, setUserData }) {
//   const [minutes, setMinutes] = useState(activeTask?.duration ? activeTask.duration : 60);
//   const [seconds, setSeconds] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);
//   const [message, setMessage] = useState('');
//   const [isMusicPlaying, setIsMusicPlaying] = useState(false);
//   const audioRef = useRef(null);
//   let timerInterval;

//   useEffect(() => {
//     return () => clearInterval(timerInterval);
//   }, []);

//   const startTimer = () => {
//     const totalSeconds = minutes * 60 + seconds;
//     if (totalSeconds < 3600) {
//       setMessage('The timer must be at least 60 minutes.');
//       return;
//     }

//     setMessage('');
//     setIsRunning(true);
//     let currentSeconds = totalSeconds;
//     timerInterval = setInterval(() => {
//       if (currentSeconds <= 0) {
//         clearInterval(timerInterval);
//         setIsRunning(false);
//         setMessage('Time is up!');
//         if (activeTask) {
//           setTasks(prevTasks => prevTasks.map(task => 
//             task.id === activeTask.id ? { ...task, completed: true } : task
//           ));
//           setUserData(prev => ({
//             ...prev,
//             xp: prev.xp + 10,
//             history: [...prev.history, { ...activeTask, completedAt: new Date().toISOString() }]
//           }));
//         }
//         return;
//       }
//       currentSeconds--;
//       setMinutes(Math.floor(currentSeconds / 60));
//       setSeconds(currentSeconds % 60);
//     }, 1000);
//   };

//   const pauseTimer = () => {
//     clearInterval(timerInterval);
//     setIsRunning(false);
//     setMessage('Timer paused.');
//   };

//   const resetTimer = () => {
//     clearInterval(timerInterval);
//     setIsRunning(false);
//     setMinutes(activeTask?.duration ? activeTask.duration : 60);
//     setSeconds(0);
//     setMessage('');
//   };

//   const handleMinutesChange = (e) => {
//     const value = parseInt(e.target.value, 10);
//     if (!isNaN(value) && value >= 0) {
//       setMinutes(value);
//     }
//   };

//   const handleSecondsChange = (e) => {
//     const value = parseInt(e.target.value, 10);
//     if (!isNaN(value) && value >= 0 && value < 60) {
//       setSeconds(value);
//     }
//   };

//   const toggleMusic = () => {
//     if (isMusicPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play();
//     }
//     setIsMusicPlaying(!isMusicPlaying);
//   };

//   return (
//     <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
//       <audio ref={audioRef} loop src="https://www.dropbox.com/s/xci6pjthkc751e8/Memories%20of%20a%20Friend.mp3?raw=1" />
//       <motion.div
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col items-center space-y-8"
//       >
//         <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
//           Pomodoro Timer
//         </h2>

//         {/* Timer Display */}
//         <div className="relative">
//           <motion.div
//             key={`${minutes}:${seconds}`}
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.3 }}
//             className="text-6xl sm:text-7xl font-mono font-extrabold text-blue-600 tracking-wide"
//           >
//             {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
//           </motion.div>
//         </div>

//         {/* Time Input */}
//         <div className="flex items-center space-x-2">
//           <input
//             type="number"
//             min="60"
//             value={minutes}
//             onChange={handleMinutesChange}
//             disabled={isRunning}
//             className="w-20 text-center text-xl rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
//           />
//           <span className="text-2xl font-bold">:</span>
//           <input
//             type="number"
//             min="0"
//             max="59"
//             value={seconds}
//             onChange={handleSecondsChange}
//             disabled={isRunning}
//             className="w-20 text-center text-xl rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
//           />
//         </div>

//         {/* Message Area */}
//         {message && (
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-red-500 font-semibold"
//           >
//             {message}
//           </motion.p>
//         )}

//         {/* Timer Controls */}
//         <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
//           {!isRunning ? (
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={startTimer}
//               className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
//             >
//               <Play size={20} />
//               <span>Start</span>
//             </motion.button>
//           ) : (
//             <>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={pauseTimer}
//                 className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
//               >
//                 <Pause size={20} />
//                 <span>Pause</span>
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={resetTimer}
//                 className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
//               >
//                 <RefreshCw size={20} />
//                 <span>Reset</span>
//               </motion.button>
//             </>
//           )}
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={toggleMusic}
//             className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 font-semibold shadow-md transition-colors duration-200"
//           >
//             <Music size={20} />
//             <span>{isMusicPlaying ? 'Pause Music' : 'Play Music'}</span>
//           </motion.button>
//         </div>
//       </motion.div>

//       {activeTask && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white p-6 rounded-2xl shadow-lg mt-8 w-full max-w-lg text-left"
//         >
//           <div className="flex items-center space-x-3 mb-2">
//             <Timer className="w-6 h-6 text-blue-500" />
//             <h3 className="text-xl font-semibold text-gray-800">Currently Focused On</h3>
//           </div>
//           <p className="text-gray-700 font-medium">{activeTask.title}</p>
//           <p className="text-gray-500 text-sm">{activeTask.description}</p>
//         </motion.div>
//       )}
//     </div>
//   );
// }

// // -----------------------------------------------------------------------------
// // 6. TaskCard, TaskModal, TasksPage
// // -----------------------------------------------------------------------------
// function TaskCard({ task, index, onStart, onEdit, onDelete, onToggleComplete }) {
//   const priorityColors = {
//     high: 'text-red-500',
//     medium: 'text-yellow-500',
//     low: 'text-green-500',
//   };

//   const energyColors = {
//     High: 'text-blue-500',
//     Medium: 'text-orange-500',
//     Low: 'text-teal-500',
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.3, delay: index * 0.05 }}
//       className={`relative bg-white rounded-2xl shadow-lg p-6 border ${task.completed ? 'border-green-300' : 'border-gray-200'} hover:border-blue-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1`}
//     >
//       <div className="flex justify-between items-start mb-4">
//         <h3 className={`text-lg sm:text-xl font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
//           {task.title}
//         </h3>
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => onToggleComplete(task)}
//           className={`w-6 h-6 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center transition-all duration-200`}
//         >
//           {task.completed && (
//             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//             </svg>
//           )}
//         </motion.button>
//       </div>

//       <p className={`text-sm sm:text-base text-gray-500 mb-4 ${task.completed ? 'line-through' : ''}`}>
//         {task.description}
//       </p>

//       <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm mb-4">
//         <div className="flex items-center text-gray-500">
//           <Clock className="w-4 h-4 mr-2" />
//           <span>{task.duration} min</span>
//         </div>
//         <div className="flex items-center text-gray-500">
//           <Zap className={`w-4 h-4 mr-2 ${energyColors[task.energy]}`} />
//           <span>{task.energy} Energy</span>
//         </div>
//         <div className="flex items-center text-gray-500">
//           <Calendar className="w-4 h-4 mr-2" />
//           <span>{format(new Date(task.date), 'MMM dd')}</span>
//         </div>
//         <div className="flex items-center text-gray-500">
//           <span className={`w-2 h-2 rounded-full mr-2 ${priorityColors[task.priority] === 'text-red-500' ? 'bg-red-500' : priorityColors[task.priority] === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
//           <span>{task.priority} Priority</span>
//         </div>
//       </div>

//       <div className="flex justify-end space-x-2 mt-4">
//         {!task.completed && (
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => onStart(task)}
//             className="flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg"
//             title="Start Task"
//           >
//             <Play className="w-5 h-5" />
//           </motion.button>
//         )}
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => onEdit(task)}
//           className="flex items-center text-yellow-500 hover:text-yellow-600 transition-colors duration-200 p-2 rounded-lg"
//           title="Edit Task"
//         >
//           <Edit className="w-5 h-5" />
//         </motion.button>
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={() => onDelete(task.id)}
//           className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg"
//           title="Delete Task"
//         >
//           <Trash2 className="w-5 h-5" />
//         </motion.button>
//       </div>
//     </motion.div>
//   );
// }

// function TaskModal({ isOpen, onClose, onSubmit, editingTask }) {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [duration, setDuration] = useState(30);
//   const [energy, setEnergy] = useState('Medium');
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [priority, setPriority] = useState('medium');

//   useEffect(() => {
//     if (editingTask) {
//       setTitle(editingTask.title);
//       setDescription(editingTask.description);
//       setDuration(editingTask.duration);
//       setEnergy(editingTask.energy);
//       setDate(editingTask.date);
//       setPriority(editingTask.priority);
//     } else {
//       setTitle('');
//       setDescription('');
//       setDuration(30);
//       setEnergy('Medium');
//       setDate(new Date().toISOString().split('T')[0]);
//       setPriority('medium');
//     }
//   }, [editingTask, isOpen]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit({ title, description, duration: Number(duration), energy, date, priority });
//   };

//   if (!isOpen) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//         >
//           <X className="w-6 h-6" />
//         </button>
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           {editingTask ? 'Edit Task' : 'Add New Task'}
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-1">Title</label>
//             <input
//               type="text"
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-1">Description</label>
//             <textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
//               rows="3"
//             ></textarea>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="duration" className="block text-gray-700 text-sm font-medium mb-1">Duration (min)</label>
//               <input
//                 type="number"
//                 id="duration"
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 min="5"
//                 step="5"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="energy" className="block text-gray-700 text-sm font-medium mb-1">Energy Required</label>
//               <select
//                 id="energy"
//                 value={energy}
//                 onChange={(e) => setEnergy(e.target.value)}
//                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               >
//                 <option value="Low">Low</option>
//                 <option value="Medium">Medium</option>
//                 <option value="High">High</option>
//               </select>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label htmlFor="date" className="block text-gray-700 text-sm font-medium mb-1">Due Date</label>
//               <input
//                 type="date"
//                 id="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="priority" className="block text-gray-700 text-sm font-medium mb-1">Priority</label>
//               <select
//                 id="priority"
//                 value={priority}
//                 onChange={(e) => setPriority(e.target.value)}
//                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 required
//               >
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//               </select>
//             </div>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
//           >
//             {editingTask ? 'Save Changes' : 'Add Task'}
//           </motion.button>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// }

// function StartTaskModal({ isOpen, onClose, onSelectMode }) {
//   if (!isOpen) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
//       >
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//         >
//           <X className="w-6 h-6" />
//         </button>
//         <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//           Choose Your Focus Mode
//         </h2>
//         <div className="flex flex-col space-y-4">
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => onSelectMode('focus')}
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
//           >
//             <LucideFocus className="w-6 h-6" />
//             <span>Focus Mode</span>
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => onSelectMode('pomodoro')}
//             className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
//           >
//             <Timer className="w-6 h-6" />
//             <span>Pomodoro Technique</span>
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// function TasksPage({ tasks, setTasks, onPlayTask, productivityLevel, setUserData }) {
//   const [filteredTasks, setFilteredTasks] = useState(tasks);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isStartModalOpen, setIsStartModalOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [taskToStart, setTaskToStart] = useState(null);
//   const [filters, setFilters] = useState({
//     status: 'all',
//     search: '',
//     date: new Date().toISOString().split('T')[0]
//   });

//   useEffect(() => {
//     let filtered = tasks;

//     if (productivityLevel) {
//       filtered = filtered.filter(task => task.energy.toLowerCase() === productivityLevel.toLowerCase());
//     }

//     if (filters.status !== 'all') {
//       if (filters.status === 'completed') {
//         filtered = filtered.filter(task => task.completed);
//       } else {
//         filtered = filtered.filter(task => !task.completed);
//       }
//     }

//     if (filters.search) {
//       filtered = filtered.filter(task =>
//         task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//         task.description.toLowerCase().includes(filters.search.toLowerCase())
//       );
//     }

//     if (filters.date) {
//       filtered = filtered.filter(task => task.date === filters.date);
//     }

//     setFilteredTasks(filtered);
//   }, [tasks, filters, productivityLevel]);

//   const handleAddTask = (taskData) => {
//     const newTask = {
//       id: Date.now(),
//       ...taskData,
//       completed: false,
//       postponedCount: 0,
//       createdAt: new Date().toISOString()
//     };
//     setTasks([...tasks, newTask]);
//     setIsModalOpen(false);
//   };

//   const handleEditTask = (taskData) => {
//     setTasks(tasks.map(task =>
//       task.id === editingTask.id ? { ...task, ...taskData } : task
//     ));
//     setEditingTask(null);
//     setIsModalOpen(false);
//   };

//   const handleDeleteTask = (taskId) => {
//     setTasks(tasks.filter(task => task.id !== taskId));
//   };

//   const handleToggleComplete = (task) => {
//     const isCompleting = !task.completed;
//     setTasks(tasks.map(t =>
//       t.id === task.id ? { ...t, completed: !t.completed } : t
//     ));
//     if (isCompleting) {
//       setUserData(prev => ({
//         ...prev,
//         xp: prev.xp + 10,
//         history: [...prev.history, { ...task, completedAt: new Date().toISOString() }]
//       }));
//     }
//   };

//   const openEditModal = (task) => {
//     setEditingTask(task);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingTask(null);
//   };

//   const openStartModal = (task) => {
//     setTaskToStart(task);
//     setIsStartModalOpen(true);
//   };

//   const closeStartModal = () => {
//     setIsStartModalOpen(false);
//     setTaskToStart(null);
//   };

//   const handleModeSelection = (mode) => {
//     onPlayTask(mode, taskToStart);
//     closeStartModal();
//   };

//   const tasksForDay = tasks.filter(task => task.date === filters.date && (!productivityLevel || task.energy.toLowerCase() === productivityLevel.toLowerCase()));
//   const completedTasks = tasksForDay.filter(task => task.completed).length;
//   const totalTasks = tasksForDay.length;

//   return (
//     <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
//                 Task Manager
//               </h1>
//               <p className="text-gray-500 mt-2">
//                 {format(new Date(filters.date), 'EEEE, MMMM do, yyyy')} • {completedTasks}/{totalTasks} completed
//               </p>
//             </div>
            
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setIsModalOpen(true)}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium flex items-center space-x-2 shadow-md w-full sm:w-auto justify-center"
//             >
//               <Plus className="w-5 h-5" />
//               <span>Add Task</span>
//             </motion.button>
//           </div>

//           <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search tasks..."
//                   value={filters.search}
//                   onChange={(e) => setFilters({...filters, search: e.target.value})}
//                   className="w-full bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <select
//                 value={filters.status}
//                 onChange={(e) => setFilters({...filters, status: e.target.value})}
//                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="all">All Tasks</option>
//                 <option value="pending">Pending</option>
//                 <option value="completed">Completed</option>
//               </select>

//               <input
//                 type="date"
//                 value={filters.date || ''}
//                 onChange={(e) => setFilters({...filters, date: e.target.value})}
//                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//         </div>

//         <AnimatePresence>
//           {filteredTasks.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center py-8 sm:py-16"
//             >
//               <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
//                 <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks for this day</h3>
//               <p className="text-gray-500 mb-6">Try adjusting your filters or create a new task</p>
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
//               >
//                 Create First Task
//               </button>
//             </motion.div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredTasks.map((task, index) => (
//                 <TaskCard
//                   key={task.id}
//                   task={task}
//                   index={index}
//                   onStart={openStartModal}
//                   onEdit={openEditModal}
//                   onDelete={handleDeleteTask}
//                   onToggleComplete={() => handleToggleComplete(task)}
//                 />
//               ))}
//             </div>
//           )}
//         </AnimatePresence>

//         <TaskModal
//           isOpen={isModalOpen}
//           onClose={closeModal}
//           onSubmit={editingTask ? handleEditTask : handleAddTask}
//           editingTask={editingTask}
//         />
//         <StartTaskModal
//           isOpen={isStartModalOpen}
//           onClose={closeStartModal}
//           onSelectMode={handleModeSelection}
//         />
//       </div>
//     </div>
//   );
// }

// // -----------------------------------------------------------------------------
// // Productivity Modal
// // -----------------------------------------------------------------------------
// function ProductivityModal({ isOpen, onSubmit }) {
//   const [level, setLevel] = useState('Medium');

//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(level);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
//       >
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           What's your current productivity level?
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <select
//             value={level}
//             onChange={(e) => setLevel(e.target.value)}
//             className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             required
//           >
//             <option value="High">High</option>
//             <option value="Medium">Medium</option>
//             <option value="Low">Low</option>
//           </select>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
//           >
//             Submit
//           </motion.button>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// }

// // -----------------------------------------------------------------------------
// // Welcome Modal for first time users
// // -----------------------------------------------------------------------------
// function WelcomeModal({ isOpen, onSubmit }) {
//   const [name, setName] = useState('');
//   const [purpose, setPurpose] = useState('');
//   const [source, setSource] = useState('');
//   const [schedule, setSchedule] = useState('');

//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit({ name, purpose, source, schedule });
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
//       >
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           Welcome to Focus App!
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">Your Name</label>
//             <input
//               type="text"
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="purpose" className="block text-gray-700 text-sm font-medium mb-1">What do you need this app for?</label>
//             <textarea
//               id="purpose"
//               value={purpose}
//               onChange={(e) => setPurpose(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 min-h-[60px]"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="source" className="block text-gray-700 text-sm font-medium mb-1">Where did you hear about this app?</label>
//             <input
//               type="text"
//               id="source"
//               value={source}
//               onChange={(e) => setSource(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="schedule" className="block text-gray-700 text-sm font-medium mb-1">What's your daily schedule?</label>
//             <textarea
//               id="schedule"
//               value={schedule}
//               onChange={(e) => setSchedule(e.target.value)}
//               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 min-h-[100px]"
//               required
//             />
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             type="submit"
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
//           >
//             Get Started
//           </motion.button>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// }

// // -----------------------------------------------------------------------------
// // SidebarItem
// // -----------------------------------------------------------------------------
// const SidebarItem = ({ icon, text, isActive, onClick, isCollapsed }) => (
//   <button
//     onClick={onClick}
//     className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200
//       ${isActive
//         ? 'bg-blue-500 text-white shadow-md'
//         : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
//       }
//       ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'}
//     `}
//     title={isCollapsed ? text : ''}
//   >
//     <span>{icon}</span>
//     <AnimatePresence>
//       {!isCollapsed && (
//         <motion.span
//           initial={{ opacity: 0, x: -10 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -10 }}
//           transition={{ duration: 0.2 }}
//           className="font-medium whitespace-nowrap"
//         >
//           {text}
//         </motion.span>
//       )}
//     </AnimatePresence>
//   </button>
// );

// // -----------------------------------------------------------------------------
// // Settings Content
// // -----------------------------------------------------------------------------
// const SettingsContent = ({ userData, setUserData }) => (
//   <div className="bg-white p-6 rounded-2xl shadow-lg">
//     <h2 className="text-3xl font-bold text-gray-800 mb-4">Settings</h2>
//     <p className="text-gray-600 mb-4">
//       Manage your app preferences here.
//     </p>
//     {/* Add settings options, e.g. theme, notifications */}
//     <div className="space-y-4">
//       <div>
//         <label className="block text-gray-700">Theme</label>
//         <select className="w-full bg-gray-100 border rounded-lg p-2">
//           <option>Light</option>
//           <option>Dark</option>
//         </select>
//       </div>
//       {/* More settings */}
//     </div>
//   </div>
// );

// // -----------------------------------------------------------------------------
// // Profile Content
// // -----------------------------------------------------------------------------
// const ProfileContent = ({ userData, setUserData, setTasks, setProductivityLevel, setShowProductivityModal, setShowWelcomeModal }) => {
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState(userData || {});

//   useEffect(() => {
//     setFormData(userData || {});
//   }, [userData]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSave = () => {
//     setUserData(formData);
//     setEditMode(false);
//   };

//   const handleResetData = () => {
//     localStorage.clear();
//     setTasks([]);
//     setProductivityLevel(null);
//     setUserData(null);
//     setShowProductivityModal(true);
//     setShowWelcomeModal(true);
//     alert('All app data has been reset to default.');
//   };

//   if (!userData) return null;

//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-lg">
//       <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>
//       {editMode ? (
//         <div className="space-y-4">
//           <div>
//             <label className="block text-gray-700">Name</label>
//             <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Avatar URL</label>
//             <input name="avatar" value={formData.avatar} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Description</label>
//             <textarea name="desc" value={formData.desc} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Purpose</label>
//             <textarea name="purpose" value={formData.purpose} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Source</label>
//             <input name="source" value={formData.source} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <div>
//             <label className="block text-gray-700">Schedule</label>
//             <textarea name="schedule" value={formData.schedule} onChange={handleChange} className="w-full bg-gray-100 border rounded-lg p-2" />
//           </div>
//           <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded">Save</button>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {formData.avatar && <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full" />}
//           <p><strong>Name:</strong> {formData.name}</p>
//           <p><strong>Description:</strong> {formData.desc}</p>
//           <p><strong>Purpose:</strong> {formData.purpose}</p>
//           <p><strong>Source:</strong> {formData.source}</p>
//           <p><strong>Schedule:</strong> {formData.schedule}</p>
//           <p><strong>XP:</strong> {formData.xp}</p>
//           <button onClick={() => setEditMode(true)} className="bg-yellow-500 text-white py-2 px-4 rounded">Edit</button>
//         </div>
//       )}
//       <h3 className="text-2xl font-bold mt-8 mb-4">Task History</h3>
//       <ul className="space-y-2">
//         {formData.history?.map((item, index) => (
//           <li key={index} className="bg-gray-100 p-2 rounded">
//             {item.title} - Completed on {format(new Date(item.completedAt), 'MMM d, yyyy HH:mm')}
//           </li>
//         ))}
//       </ul>
//       <button
//         onClick={handleResetData}
//         className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-200 mt-8"
//       >
//         Reset All App Data
//       </button>
//     </div>
//   );
// };

// // -----------------------------------------------------------------------------
// // AI Assistant Placeholder
// // -----------------------------------------------------------------------------
// const AIAssistantContent = () => (
//   <div className="bg-white p-6 rounded-2xl shadow-lg">
//     <h2 className="text-3xl font-bold text-gray-800 mb-4">AI Assistant</h2>
//     <p className="text-gray-600">
//       Coming soon! This will be an AI-powered assistant to help with task suggestions, productivity tips, and more.
//     </p>
//   </div>
// );

// export default App;
// // v1
// // "use client"
// // import React, { useState, useEffect } from 'react';
// // import { LayoutDashboard, Timer, LucideFocus, Settings, User, Menu, X, CircleCheck, ListTodo, Plus, Search, Calendar, Clock, Zap, Play, Edit, Trash2, TrendingUp, TrendingDown, RefreshCw, Pause, StopCircle } from 'lucide-react';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { format, subDays, getDayOfYear, isSameDay } from 'date-fns';
// // import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// // // -----------------------------------------------------------------------------
// // // 1. Main App Component
// // //    This is the main container for the entire application.
// // // -----------------------------------------------------------------------------
// // function App() {
// //   // State to track which section is currently active (e.g., 'dashboard', 'tasks').
// //   const [activeSection, setActiveSection] = useState('tasks');
// //   // State to control the mobile sidebar's visibility.
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   // State to control the desktop sidebar's collapsed state.
// //   const [isCollapsed, setIsCollapsed] = useState(false);
// //   // State to track the currently selected task for the timer.
// //   const [activeTask, setActiveTask] = useState(null);

// //   // Load tasks from local storage or use initial data if none exists.
// //   const [tasks, setTasks] = useState(() => {
// //     try {
// //       const storedTasks = localStorage.getItem('focus-app-tasks');
// //       return storedTasks ? JSON.parse(storedTasks) : initialTasks;
// //     } catch (error) {
// //       console.error("Failed to load tasks from localStorage", error);
// //       return initialTasks;
// //     }
// //   });

// //   // Save tasks to local storage whenever the tasks state changes.
// //   useEffect(() => {
// //     try {
// //       localStorage.setItem('focus-app-tasks', JSON.stringify(tasks));
// //     } catch (error) {
// //       console.error("Failed to save tasks to localStorage", error);
// //     }
// //   }, [tasks]);


// //   // Handler to change the active section.
// //   const handleSectionChange = (section, task = null) => {
// //     setActiveSection(section);
// //     setActiveTask(task);
// //     setIsSidebarOpen(false); // Close sidebar on mobile
// //   };

// //   // Helper function to render the correct content based on the active section.
// //   const renderContent = () => {
// //     switch (activeSection) {
// //       case 'dashboard':
// //         return <DashboardContent tasks={tasks} />;
// //       case 'focus':
// //         return <FocusModeContent activeTask={activeTask} setTasks={setTasks} />;
// //       case 'pomodoro':
// //         return <PomodoroContent activeTask={activeTask} setTasks={setTasks} />;
// //       case 'tasks':
// //         // Pass the handleSectionChange function and tasks/setTasks to the TasksPage
// //         return <TasksPage tasks={tasks} setTasks={setTasks} onPlayTask={handleSectionChange} />;
// //       case 'settings':
// //         return <SettingsContent />;
// //       case 'profile':
// //         return <ProfileContent setTasks={setTasks} />;
// //       default:
// //         return <DashboardContent tasks={tasks} />;
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans text-gray-800">

// //       {/* Mobile menu button */}
// //       <div className="md:hidden p-4 flex justify-between items-center bg-white shadow-md">
// //         <h1 className="text-xl font-bold text-gray-800">Focus App</h1>
// //         <button
// //           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
// //           className="p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
// //         >
// //           {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
// //         </button>
// //       </div>

// //       {/* Mobile menu overlay */}
// //       {isSidebarOpen && (
// //         <div
// //           className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden"
// //           onClick={() => setIsSidebarOpen(false)}
// //         ></div>
// //       )}

// //       {/* Sidebar Component */}
// //       <aside
// //         className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
// //         bg-white shadow-lg p-6 flex flex-col space-y-4
// //         ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
// //         ${isCollapsed ? 'md:w-20' : 'md:w-64'}
// //         md:relative md:translate-x-0 md:p-4`}
// //       >
// //         <div className="flex justify-between items-center flex-shrink-0 mb-8">
// //           {/* Main App Title, only visible when not collapsed */}
// //           {!isCollapsed && (
// //             <h1 className="text-3xl font-bold text-gray-800 tracking-tight transition-opacity duration-300">Focus App</h1>
// //           )}
// //           {/* Hamburger/Collapse button for desktop and close for mobile */}
// //           <button
// //             onClick={() => {
// //               // On desktop, toggle the collapsed state
// //               if (window.innerWidth >= 768) {
// //                 setIsCollapsed(!isCollapsed);
// //               } else {
// //                 // On mobile, toggle the sidebar's open state
// //                 setIsSidebarOpen(!isSidebarOpen);
// //               }
// //             }}
// //             className={`p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
// //           >
// //             {isCollapsed ? <Menu size={24} /> : <X size={24} />}
// //           </button>
// //         </div>
// //         {/* Navigation links */}
// //         <nav className="flex-1 space-y-2">
// //           <SidebarItem
// //             icon={<LayoutDashboard size={20} />}
// //             text="Dashboard"
// //             isActive={activeSection === 'dashboard'}
// //             onClick={() => handleSectionChange('dashboard')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<LucideFocus size={20} />}
// //             text="Focus Mode"
// //             isActive={activeSection === 'focus'}
// //             onClick={() => handleSectionChange('focus')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<Timer size={20} />}
// //             text="Pomodoro"
// //             isActive={activeSection === 'pomodoro'}
// //             onClick={() => handleSectionChange('pomodoro')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<ListTodo size={20} />}
// //             text="Task Manager"
// //             isActive={activeSection === 'tasks'}
// //             onClick={() => handleSectionChange('tasks')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<Settings size={20} />}
// //             text="Settings"
// //             isActive={activeSection === 'settings'}
// //             onClick={() => handleSectionChange('settings')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<User size={20} />}
// //             text="Profile"
// //             isActive={activeSection === 'profile'}
// //             onClick={() => handleSectionChange('profile')}
// //             isCollapsed={isCollapsed}
// //           />
// //         </nav>
// //       </aside>

// //       {/* Main content area */}
// //       <main className="flex-1 flex flex-col overflow-y-auto">
// //         <div className="p-4 sm:p-6 lg:p-8">
// //           {renderContent()}
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 2. Sample Initial Data
// // // -----------------------------------------------------------------------------
// // const initialTasks = [
// //   {
// //     id: 1,
// //     title: 'Complete React Components',
// //     duration: 45,
// //     energy: 'High',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: false,
// //     postponedCount: 0,
// //     priority: 'high',
// //     description: 'Build responsive task cards with animations',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 2,
// //     title: 'Design Database Schema',
// //     duration: 30,
// //     energy: 'Medium',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: false,
// //     postponedCount: 1,
// //     priority: 'medium',
// //     description: 'Create MongoDB collections for users and tasks',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 3,
// //     title: 'Review Documentation',
// //     duration: 20,
// //     energy: 'Low',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: true,
// //     postponedCount: 0,
// //     priority: 'low',
// //     description: 'Read through API documentation and examples',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 4,
// //     title: 'Team Standup Meeting',
// //     duration: 15,
// //     energy: 'Medium',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: false,
// //     postponedCount: 0,
// //     priority: 'high',
// //     description: 'Daily sync with the development team',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 5,
// //     title: 'Implement Authentication',
// //     duration: 60,
// //     energy: 'High',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: false,
// //     postponedCount: 2,
// //     priority: 'high',
// //     description: 'Add login/signup with JWT and session management',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 6,
// //     title: 'Write project proposal',
// //     duration: 90,
// //     energy: 'High',
// //     date: subDays(new Date(), 1).toISOString().split('T')[0],
// //     completed: true,
// //     postponedCount: 0,
// //     priority: 'high',
// //     description: 'Draft and refine the project proposal document.',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 7,
// //     title: 'Review PRs from team',
// //     duration: 60,
// //     energy: 'Medium',
// //     date: subDays(new Date(), 2).toISOString().split('T')[0],
// //     completed: true,
// //     postponedCount: 0,
// //     priority: 'medium',
// //     description: 'Check and merge pull requests from team members.',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 8,
// //     title: 'Bug Fixes',
// //     duration: 40,
// //     energy: 'Low',
// //     date: subDays(new Date(), 3).toISOString().split('T')[0],
// //     completed: true,
// //     postponedCount: 0,
// //     priority: 'high',
// //     description: 'Address and resolve reported bugs in the application.',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 9,
// //     title: 'Update dependencies',
// //     duration: 25,
// //     energy: 'Low',
// //     date: subDays(new Date(), 4).toISOString().split('T')[0],
// //     completed: true,
// //     postponedCount: 0,
// //     priority: 'low',
// //     description: 'Update project dependencies to the latest versions.',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 10,
// //     title: 'Research new technologies',
// //     duration: 30,
// //     energy: 'Medium',
// //     date: subDays(new Date(), 5).toISOString().split('T')[0],
// //     completed: true,
// //     postponedCount: 0,
// //     priority: 'medium',
// //     description: 'Explore new frameworks and libraries for future projects.',
// //     createdAt: new Date().toISOString()
// //   }
// // ];

// // // -----------------------------------------------------------------------------
// // // 3. DashboardContent Component (Updated to use tasks prop)
// // // -----------------------------------------------------------------------------
// // function DashboardContent({ tasks }) {
// //   // Mock data for the dashboard. In a real app, this would come from a database.
// //   const allTasks = tasks;
// //   const completedTasksCount = allTasks.filter(task => task.completed).length;
// //   const totalTasksToday = allTasks.filter(task => task.date === new Date().toISOString().split('T')[0]).length;
// //   const tasksDueToday = allTasks.filter(task => task.date === new Date().toISOString().split('T')[0] && !task.completed).length;
// //   const totalFocusTime = allTasks.filter(task => task.completed).reduce((sum, task) => sum + task.duration, 0);

// //   // Data for the task completion chart
// //   const weeklyData = [
// //     { name: format(subDays(new Date(), 6), 'E'), tasksCompleted: allTasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 6))).length },
// //     { name: format(subDays(new Date(), 5), 'E'), tasksCompleted: allTasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 5))).length },
// //     { name: format(subDays(new Date(), 4), 'E'), tasksCompleted: allTasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 4))).length },
// //     { name: format(subDays(new Date(), 3), 'E'), tasksCompleted: allTasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 3))).length },
// //     { name: format(subDays(new Date(), 2), 'E'), tasksCompleted: allTasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 2))).length },
// //     { name: format(subDays(new Date(), 1), 'E'), tasksCompleted: allTasks.filter(t => isSameDay(new Date(t.createdAt), subDays(new Date(), 1))).length },
// //     { name: format(new Date(), 'E'), tasksCompleted: allTasks.filter(t => isSameDay(new Date(t.createdAt), new Date())).length }, // Dynamically show today's count
// //   ];

// //   return (
// //     <div className="p-4 sm:p-6 lg:p-8">
// //       <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
// //       {/* Metric Cards Section */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
// //         {/* Completed Tasks Card */}
// //         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
// //           <div>
// //             <p className="text-gray-500 text-sm mb-1">Completed Tasks</p>
// //             <h2 className="text-3xl font-bold text-gray-800">{completedTasksCount}</h2>
// //           </div>
// //           <CircleCheck className="w-10 h-10 text-green-500" />
// //         </div>
        
// //         {/* Total Focus Time Card */}
// //         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
// //           <div>
// //             <p className="text-gray-500 text-sm mb-1">Total Focus Time</p>
// //             <h2 className="text-3xl font-bold text-gray-800">{totalFocusTime} <span className="text-base text-gray-500">min</span></h2>
// //           </div>
// //           <Clock className="w-10 h-10 text-blue-500" />
// //         </div>

// //         {/* Tasks Due Today Card */}
// //         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
// //           <div>
// //             <p className="text-gray-500 text-sm mb-1">Tasks Due Today</p>
// //             <h2 className="text-3xl font-bold text-gray-800">{tasksDueToday}</h2>
// //           </div>
// //           <ListTodo className="w-10 h-10 text-yellow-500" />
// //         </div>

// //         {/* Postponed Tasks Card */}
// //         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
// //           <div>
// //             <p className="text-gray-500 text-sm mb-1">Postponed</p>
// //             <h2 className="text-3xl font-bold text-gray-800">{allTasks.filter(t => t.postponedCount > 0).length}</h2>
// //           </div>
// //           <TrendingDown className="w-10 h-10 text-red-500" />
// //         </div>
// //       </div>

// //       {/* Graphs and Charts Section */}
// //       <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
// //         <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Task Completion</h2>
// //         <div className="w-full h-64">
// //           <ResponsiveContainer width="100%" height="100%">
// //             <LineChart data={weeklyData}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
// //               <XAxis dataKey="name" tickLine={false} axisLine={false} />
// //               <YAxis tickLine={false} axisLine={false} />
// //               <Tooltip
// //                 contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
// //                 labelStyle={{ fontWeight: 'bold' }}
// //                 itemStyle={{ color: '#1f2937' }}
// //                 formatter={(value) => [`${value} tasks`, 'Completed']}
// //               />
// //               <Line type="monotone" dataKey="tasksCompleted" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }} />
// //             </LineChart>
// //           </ResponsiveContainer>
// //         </div>
// //       </div>

// //       {/* Recent Activity Section */}
// //       <div className="bg-white p-6 rounded-2xl shadow-lg">
// //         <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
// //         <ul className="space-y-4">
// //           {allTasks.filter(t => t.completed).slice(0, 5).map(task => (
// //             <li key={task.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
// //               <CircleCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
// //               <div className="flex-1">
// //                 <p className="font-semibold text-gray-700">{task.title}</p>
// //                 <p className="text-sm text-gray-500">{task.description}</p>
// //               </div>
// //               <p className="text-sm text-gray-400 flex-shrink-0">
// //                 {format(new Date(task.createdAt), 'MMM d')}
// //               </p>
// //             </li>
// //           ))}
// //         </ul>
// //       </div>

// //     </div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 4. FocusModeContent Component (Updated to handle task completion)
// // // -----------------------------------------------------------------------------
// // function FocusModeContent({ activeTask, setTasks }) {
// //   // State for selected hours and minutes
// //   const [hours, setHours] = useState(activeTask?.duration ? Math.floor(activeTask.duration / 60) : 1);
// //   const [minutes, setMinutes] = useState(activeTask?.duration ? (activeTask.duration % 60) : 0);

// //   // State for timer countdown
// //   const [time, setTime] = useState(activeTask?.duration ? activeTask.duration * 60 : 60 * 60); // Default to 1 hour if no task or use task duration
// //   const [isRunning, setIsRunning] = useState(false);
// //   const [sessionsToday, setSessionsToday] = useState(0);
// //   const [lastSessionDay, setLastSessionDay] = useState(getDayOfYear(new Date()));
// //   const [message, setMessage] = useState('');
// //   let timerInterval;

// //   // Reset sessions at the start of a new day
// //   useEffect(() => {
// //     const today = getDayOfYear(new Date());
// //     if (today !== lastSessionDay) {
// //       setSessionsToday(0);
// //       setLastSessionDay(today);
// //     }
// //     // Cleanup interval on unmount
// //     return () => clearInterval(timerInterval);
// //   }, [lastSessionDay]);
  
// //   // Recalculate time whenever hours or minutes change
// //   useEffect(() => {
// //     setTime((hours * 60 * 60) + (minutes * 60));
// //   }, [hours, minutes]);

// //   // Handle the timer countdown
// //   useEffect(() => {
// //     let interval = null;
// //     if (isRunning) {
// //       interval = setInterval(() => {
// //         setTime(prevTime => {
// //           if (prevTime <= 1) {
// //             setIsRunning(false);
// //             // Mark the task as completed when timer hits 0
// //             if (activeTask) {
// //               setTasks(prevTasks => prevTasks.map(task => 
// //                 task.id === activeTask.id ? { ...task, completed: true } : task
// //               ));
// //             }
// //             // Increment sessions when timer hits 0
// //             setSessionsToday(prevCount => prevCount + 1);
// //             return 0;
// //           }
// //           return prevTime - 1;
// //         });
// //       }, 1000);
// //     } else if (!isRunning && time !== 0) {
// //       clearInterval(interval);
// //     }
// //     return () => clearInterval(interval);
// //   }, [isRunning, time, activeTask, setTasks]);

// //   const toggleTimer = () => {
// //     const totalMinutes = (hours * 60) + minutes;
// //     if (totalMinutes < 60) {
// //       setMessage('Focus session must be at least 60 minutes.');
// //       setIsRunning(false);
// //       return;
// //     }

// //     setMessage('');
// //     setIsRunning(!isRunning);
// //   };

// //   const resetTimer = () => {
// //     setIsRunning(false);
// //     setHours(activeTask?.duration ? Math.floor(activeTask.duration / 60) : 1);
// //     setMinutes(activeTask?.duration ? (activeTask.duration % 60) : 0);
// //     setTime(activeTask?.duration ? activeTask.duration * 60 : 60 * 60);
// //     setMessage('');
// //   };

// //   const continueSession = () => {
// //     setIsRunning(true);
// //     setHours(1);
// //     setMinutes(0);
// //   };

// //   // Format the time for display
// //   const formatTime = (timeInSeconds) => {
// //     const totalMinutes = Math.floor(timeInSeconds / 60);
// //     const displayMinutes = totalMinutes % 60;
// //     const displayHours = Math.floor(totalMinutes / 60);
// //     const displaySeconds = timeInSeconds % 60;
// //     return `${displayHours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
// //   };

// //   return (
// //     <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
// //       <motion.div
// //         initial={{ scale: 0.8, opacity: 0 }}
// //         animate={{ scale: 1, opacity: 1 }}
// //         transition={{ duration: 0.5 }}
// //         className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col items-center space-y-8"
// //       >
// //         <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
// //           Focus Session
// //         </h2>

// //         {/* Display Timer */}
// //         <div className="relative">
// //           <motion.div
// //             key={time}
// //             initial={{ scale: 0.8, opacity: 0 }}
// //             animate={{ scale: 1, opacity: 1 }}
// //             transition={{ duration: 0.3 }}
// //             className="text-6xl sm:text-7xl font-mono font-extrabold text-blue-600 tracking-wide"
// //           >
// //             {formatTime(time)}
// //           </motion.div>
// //           <div className="text-lg text-gray-500 mt-2">
// //             Session {sessionsToday + 1}
// //           </div>
// //         </div>

// //         {/* Time Input with Scrollable Dropdowns */}
// //         <div className="flex items-center space-x-2">
// //           <select
// //             value={hours}
// //             onChange={(e) => setHours(parseInt(e.target.value))}
// //             className="w-20 text-center text-xl rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
// //             disabled={isRunning}
// //           >
// //             {Array.from({ length: 4 }, (_, i) => i + 1).map(h => (
// //               <option key={h} value={h}>{h}</option>
// //             ))}
// //           </select>
// //           <span className="text-base font-medium text-gray-700">hours</span>
// //           <select
// //             value={minutes}
// //             onChange={(e) => setMinutes(parseInt(e.target.value))}
// //             className="w-20 text-center text-xl rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
// //             disabled={isRunning}
// //           >
// //             {Array.from({ length: 60 }, (_, i) => i).map(m => (
// //               <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
// //             ))}
// //           </select>
// //           <span className="text-base font-medium text-gray-700">min</span>
// //         </div>
        
// //         {/* Message Area */}
// //         {message && (
// //           <motion.p
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             className="text-red-500 font-semibold"
// //           >
// //             {message}
// //           </motion.p>
// //         )}

// //         {/* Timer Controls */}
// //         <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
// //           <motion.button
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //             onClick={toggleTimer}
// //             className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md transition-colors duration-200
// //               ${isRunning
// //                 ? 'bg-red-500 hover:bg-red-600 text-white'
// //                 : 'bg-green-500 hover:bg-green-600 text-white'
// //               }`}
// //           >
// //             {isRunning ? (
// //               <>
// //                 <Zap size={20} />
// //                 <span>Pause</span>
// //               </>
// //             ) : (
// //               <>
// //                 <Play size={20} />
// //                 <span>Start</span>
// //               </>
// //             )}
// //           </motion.button>
// //           <motion.button
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //             onClick={resetTimer}
// //             className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold shadow-md transition-colors duration-200"
// //           >
// //             <RefreshCw size={20} />
// //             <span>Reset</span>
// //           </motion.button>
// //         </div>
// //         {time === 0 && (
// //           <motion.button
// //             initial={{ opacity: 0, y: 10 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: 0.5 }}
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //             onClick={continueSession}
// //             className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-colors duration-200 mt-4"
// //           >
// //             Continue Session
// //           </motion.button>
// //         )}
// //       </motion.div>
// //       <div className="mt-6 text-lg font-medium text-gray-600">
// //         Sessions Completed Today: <span className="text-blue-500 font-bold">{sessionsToday}</span>
// //       </div>

// //       {activeTask && (
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           className="bg-white p-6 rounded-2xl shadow-lg mt-8 w-full max-w-lg text-left"
// //         >
// //           <div className="flex items-center space-x-3 mb-2">
// //             <LucideFocus className="w-6 h-6 text-blue-500" />
// //             <h3 className="text-xl font-semibold text-gray-800">Currently Focused On</h3>
// //           </div>
// //           <p className="text-gray-700 font-medium">{activeTask.title}</p>
// //           <p className="text-gray-500 text-sm">{activeTask.description}</p>
// //         </motion.div>
// //       )}
// //     </div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 5. PomodoroContent Component (Updated to handle task completion)
// // // -----------------------------------------------------------------------------
// // function PomodoroContent({ activeTask, setTasks }) {
// //   const [minutes, setMinutes] = useState(activeTask?.duration ? activeTask.duration : 60);
// //   const [seconds, setSeconds] = useState(0);
// //   const [isRunning, setIsRunning] = useState(false);
// //   const [message, setMessage] = useState('');
// //   let timerInterval;

// //   useEffect(() => {
// //     // Clear the interval when the component unmounts or before a new effect runs
// //     return () => clearInterval(timerInterval);
// //   }, []);

// //   const startTimer = () => {
// //     const totalSeconds = minutes * 60 + seconds;
// //     if (totalSeconds < 3600) { // 3600 seconds = 60 minutes
// //       setMessage('The timer must be at least 60 minutes.');
// //       return;
// //     }

// //     setMessage('');
// //     setIsRunning(true);
// //     // Use a local variable to prevent a stale closure
// //     let currentSeconds = totalSeconds;
// //     timerInterval = setInterval(() => {
// //       if (currentSeconds <= 0) {
// //         clearInterval(timerInterval);
// //         setIsRunning(false);
// //         setMessage('Time is up!');
// //          // Mark the task as completed when timer hits 0
// //          if (activeTask) {
// //           setTasks(prevTasks => prevTasks.map(task => 
// //             task.id === activeTask.id ? { ...task, completed: true } : task
// //           ));
// //         }
// //         return;
// //       }
// //       currentSeconds--;
// //       setMinutes(Math.floor(currentSeconds / 60));
// //       setSeconds(currentSeconds % 60);
// //     }, 1000);
// //   };

// //   const pauseTimer = () => {
// //     clearInterval(timerInterval);
// //     setIsRunning(false);
// //     setMessage('Timer paused.');
// //   };

// //   const resetTimer = () => {
// //     clearInterval(timerInterval);
// //     setIsRunning(false);
// //     setMinutes(60);
// //     setSeconds(0);
// //     setMessage('');
// //   };

// //   const handleMinutesChange = (e) => {
// //     const value = parseInt(e.target.value, 10);
// //     if (!isNaN(value) && value >= 0) {
// //       setMinutes(value);
// //     }
// //   };

// //   const handleSecondsChange = (e) => {
// //     const value = parseInt(e.target.value, 10);
// //     if (!isNaN(value) && value >= 0 && value < 60) {
// //       setSeconds(value);
// //     }
// //   };

// //   return (
// //     <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
// //       <motion.div
// //         initial={{ scale: 0.8, opacity: 0 }}
// //         animate={{ scale: 1, opacity: 1 }}
// //         transition={{ duration: 0.5 }}
// //         className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col items-center space-y-8"
// //       >
// //         <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
// //           Pomodoro Timer
// //         </h2>

// //         {/* Timer Display */}
// //         <div className="relative">
// //           <motion.div
// //             key={`${minutes}:${seconds}`}
// //             initial={{ scale: 0.8, opacity: 0 }}
// //             animate={{ scale: 1, opacity: 1 }}
// //             transition={{ duration: 0.3 }}
// //             className="text-6xl sm:text-7xl font-mono font-extrabold text-blue-600 tracking-wide"
// //           >
// //             {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
// //           </motion.div>
// //         </div>

// //         {/* Time Input */}
// //         <div className="flex items-center space-x-2">
// //           <input
// //             type="number"
// //             min="60"
// //             value={minutes}
// //             onChange={handleMinutesChange}
// //             disabled={isRunning}
// //             className="w-20 text-center text-xl rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
// //           />
// //           <span className="text-2xl font-bold">:</span>
// //           <input
// //             type="number"
// //             min="0"
// //             max="59"
// //             value={seconds}
// //             onChange={handleSecondsChange}
// //             disabled={isRunning}
// //             className="w-20 text-center text-xl rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500"
// //           />
// //         </div>

// //         {/* Message Area */}
// //         {message && (
// //           <motion.p
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             className="text-red-500 font-semibold"
// //           >
// //             {message}
// //           </motion.p>
// //         )}

// //         {/* Timer Controls */}
// //         <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
// //           {!isRunning ? (
// //             <motion.button
// //               whileHover={{ scale: 1.05 }}
// //               whileTap={{ scale: 0.95 }}
// //               onClick={startTimer}
// //               className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
// //             >
// //               <Play size={20} />
// //               <span>Start</span>
// //             </motion.button>
// //           ) : (
// //             <>
// //               <motion.button
// //                 whileHover={{ scale: 1.05 }}
// //                 whileTap={{ scale: 0.95 }}
// //                 onClick={pauseTimer}
// //                 className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
// //               >
// //                 <Pause size={20} />
// //                 <span>Pause</span>
// //               </motion.button>
// //               <motion.button
// //                 whileHover={{ scale: 1.05 }}
// //                 whileTap={{ scale: 0.95 }}
// //                 onClick={resetTimer}
// //                 className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
// //               >
// //                 <RefreshCw size={20} />
// //                 <span>Reset</span>
// //               </motion.button>
// //             </>
// //           )}
// //         </div>
// //       </motion.div>

// //       {activeTask && (
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           className="bg-white p-6 rounded-2xl shadow-lg mt-8 w-full max-w-lg text-left"
// //         >
// //           <div className="flex items-center space-x-3 mb-2">
// //             <Timer className="w-6 h-6 text-blue-500" />
// //             <h3 className="text-xl font-semibold text-gray-800">Currently Focused On</h3>
// //           </div>
// //           <p className="text-gray-700 font-medium">{activeTask.title}</p>
// //           <p className="text-gray-500 text-sm">{activeTask.description}</p>
// //         </motion.div>
// //       )}
// //     </div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 6. Other Components (TaskCard, TaskModal, TasksPage) - Unchanged
// // // -----------------------------------------------------------------------------
// // function TaskCard({ task, index, onStart, onEdit, onDelete, onToggleComplete }) {
// //   const priorityColors = {
// //     high: 'text-red-500',
// //     medium: 'text-yellow-500',
// //     low: 'text-green-500',
// //   };

// //   const energyColors = {
// //     High: 'text-blue-500',
// //     Medium: 'text-orange-500',
// //     Low: 'text-teal-500',
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       exit={{ opacity: 0, y: -20 }}
// //       transition={{ duration: 0.3, delay: index * 0.05 }}
// //       className={`relative bg-white rounded-2xl shadow-lg p-6 border ${task.completed ? 'border-green-300' : 'border-gray-200'} hover:border-blue-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1`}
// //     >
// //       <div className="flex justify-between items-start mb-4">
// //         <h3 className={`text-lg sm:text-xl font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
// //           {task.title}
// //         </h3>
// //         <motion.button
// //           whileHover={{ scale: 1.1 }}
// //           whileTap={{ scale: 0.9 }}
// //           onClick={() => onToggleComplete(task.id)}
// //           className={`w-6 h-6 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center transition-all duration-200`}
// //         >
// //           {task.completed && (
// //             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
// //             </svg>
// //           )}
// //         </motion.button>
// //       </div>

// //       <p className={`text-sm sm:text-base text-gray-500 mb-4 ${task.completed ? 'line-through' : ''}`}>
// //         {task.description}
// //       </p>

// //       <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm mb-4">
// //         <div className="flex items-center text-gray-500">
// //           <Clock className="w-4 h-4 mr-2" />
// //           <span>{task.duration} min</span>
// //         </div>
// //         <div className="flex items-center text-gray-500">
// //           <Zap className={`w-4 h-4 mr-2 ${energyColors[task.energy]}`} />
// //           <span>{task.energy} Energy</span>
// //         </div>
// //         <div className="flex items-center text-gray-500">
// //           <Calendar className="w-4 h-4 mr-2" />
// //           <span>{format(new Date(task.date), 'MMM dd')}</span>
// //         </div>
// //         <div className="flex items-center text-gray-500">
// //           <span className={`w-2 h-2 rounded-full mr-2 ${priorityColors[task.priority] === 'text-red-500' ? 'bg-red-500' : priorityColors[task.priority] === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
// //           <span>{task.priority} Priority</span>
// //         </div>
// //       </div>

// //       <div className="flex justify-end space-x-2 mt-4">
// //         {!task.completed && (
// //           <motion.button
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //             onClick={() => onStart(task)}
// //             className="flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg"
// //             title="Start Task"
// //           >
// //             <Play className="w-5 h-5" />
// //           </motion.button>
// //         )}
// //         <motion.button
// //           whileHover={{ scale: 1.05 }}
// //           whileTap={{ scale: 0.95 }}
// //           onClick={() => onEdit(task)}
// //           className="flex items-center text-yellow-500 hover:text-yellow-600 transition-colors duration-200 p-2 rounded-lg"
// //           title="Edit Task"
// //         >
// //           <Edit className="w-5 h-5" />
// //         </motion.button>
// //         <motion.button
// //           whileHover={{ scale: 1.05 }}
// //           whileTap={{ scale: 0.95 }}
// //           onClick={() => onDelete(task.id)}
// //           className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg"
// //           title="Delete Task"
// //         >
// //           <Trash2 className="w-5 h-5" />
// //         </motion.button>
// //       </div>
// //     </motion.div>
// //   );
// // }

// // function TaskModal({ isOpen, onClose, onSubmit, editingTask }) {
// //   const [title, setTitle] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [duration, setDuration] = useState(30);
// //   const [energy, setEnergy] = useState('Medium');
// //   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
// //   const [priority, setPriority] = useState('medium');

// //   useEffect(() => {
// //     if (editingTask) {
// //       setTitle(editingTask.title);
// //       setDescription(editingTask.description);
// //       setDuration(editingTask.duration);
// //       setEnergy(editingTask.energy);
// //       setDate(editingTask.date);
// //       setPriority(editingTask.priority);
// //     } else {
// //       setTitle('');
// //       setDescription('');
// //       setDuration(30);
// //       setEnergy('Medium');
// //       setDate(new Date().toISOString().split('T')[0]);
// //       setPriority('medium');
// //     }
// //   }, [editingTask, isOpen]);

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     onSubmit({ title, description, duration: Number(duration), energy, date, priority });
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       exit={{ opacity: 0 }}
// //       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
// //     >
// //       <motion.div
// //         initial={{ scale: 0.9, y: 50 }}
// //         animate={{ scale: 1, y: 0 }}
// //         exit={{ scale: 0.9, y: 50 }}
// //         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
// //       >
// //         <button
// //           onClick={onClose}
// //           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
// //         >
// //           <X className="w-6 h-6" />
// //         </button>
// //         <h2 className="text-2xl font-bold text-gray-800 mb-6">
// //           {editingTask ? 'Edit Task' : 'Add New Task'}
// //         </h2>
// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <div>
// //             <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-1">Title</label>
// //             <input
// //               type="text"
// //               id="title"
// //               value={title}
// //               onChange={(e) => setTitle(e.target.value)}
// //               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-1">Description</label>
// //             <textarea
// //               id="description"
// //               value={description}
// //               onChange={(e) => setDescription(e.target.value)}
// //               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
// //               rows="3"
// //             ></textarea>
// //           </div>
// //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //             <div>
// //               <label htmlFor="duration" className="block text-gray-700 text-sm font-medium mb-1">Duration (min)</label>
// //               <input
// //                 type="number"
// //                 id="duration"
// //                 value={duration}
// //                 onChange={(e) => setDuration(e.target.value)}
// //                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 min="5"
// //                 step="5"
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label htmlFor="energy" className="block text-gray-700 text-sm font-medium mb-1">Energy Required</label>
// //               <select
// //                 id="energy"
// //                 value={energy}
// //                 onChange={(e) => setEnergy(e.target.value)}
// //                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 required
// //               >
// //                 <option value="Low">Low</option>
// //                 <option value="Medium">Medium</option>
// //                 <option value="High">High</option>
// //               </select>
// //             </div>
// //           </div>
// //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //             <div>
// //               <label htmlFor="date" className="block text-gray-700 text-sm font-medium mb-1">Due Date</label>
// //               <input
// //                 type="date"
// //                 id="date"
// //                 value={date}
// //                 onChange={(e) => setDate(e.target.value)}
// //                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label htmlFor="priority" className="block text-gray-700 text-sm font-medium mb-1">Priority</label>
// //               <select
// //                 id="priority"
// //                 value={priority}
// //                 onChange={(e) => setPriority(e.target.value)}
// //                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 required
// //               >
// //                 <option value="low">Low</option>
// //                 <option value="medium">Medium</option>
// //                 <option value="high">High</option>
// //               </select>
// //             </div>
// //           </div>
// //           <motion.button
// //             whileHover={{ scale: 1.02 }}
// //             whileTap={{ scale: 0.98 }}
// //             type="submit"
// //             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
// //           >
// //             {editingTask ? 'Save Changes' : 'Add Task'}
// //           </motion.button>
// //         </form>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // function StartTaskModal({ isOpen, onClose, onSelectMode }) {
// //   if (!isOpen) return null;

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       exit={{ opacity: 0 }}
// //       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
// //     >
// //       <motion.div
// //         initial={{ scale: 0.9, y: 50 }}
// //         animate={{ scale: 1, y: 0 }}
// //         exit={{ scale: 0.9, y: 50 }}
// //         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
// //       >
// //         <button
// //           onClick={onClose}
// //           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
// //         >
// //           <X className="w-6 h-6" />
// //         </button>
// //         <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
// //           Choose Your Focus Mode
// //         </h2>
// //         <div className="flex flex-col space-y-4">
// //           <motion.button
// //             whileHover={{ scale: 1.02 }}
// //             whileTap={{ scale: 0.98 }}
// //             onClick={() => onSelectMode('focus')}
// //             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
// //           >
// //             <LucideFocus className="w-6 h-6" />
// //             <span>Focus Mode</span>
// //           </motion.button>
// //           <motion.button
// //             whileHover={{ scale: 1.02 }}
// //             whileTap={{ scale: 0.98 }}
// //             onClick={() => onSelectMode('pomodoro')}
// //             className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
// //           >
// //             <Timer className="w-6 h-6" />
// //             <span>Pomodoro Technique</span>
// //           </motion.button>
// //         </div>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // function TasksPage({ tasks, setTasks, onPlayTask }) {
// //   const [filteredTasks, setFilteredTasks] = useState(tasks);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [isStartModalOpen, setIsStartModalOpen] = useState(false);
// //   const [editingTask, setEditingTask] = useState(null);
// //   const [taskToStart, setTaskToStart] = useState(null);
// //   const [filters, setFilters] = useState({
// //     energy: 'all',
// //     status: 'all',
// //     search: '',
// //     date: new Date().toISOString().split('T')[0]
// //   });

// //   useEffect(() => {
// //     let filtered = tasks;

// //     if (filters.energy !== 'all') {
// //       filtered = filtered.filter(task => task.energy.toLowerCase() === filters.energy.toLowerCase());
// //     }

// //     if (filters.status !== 'all') {
// //       if (filters.status === 'completed') {
// //         filtered = filtered.filter(task => task.completed);
// //       } else {
// //         filtered = filtered.filter(task => !task.completed);
// //       }
// //     }

// //     if (filters.search) {
// //       filtered = filtered.filter(task =>
// //         task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
// //         task.description.toLowerCase().includes(filters.search.toLowerCase())
// //       );
// //     }

// //     if (filters.date) {
// //         filtered = filtered.filter(task => task.date === filters.date);
// //     }

// //     setFilteredTasks(filtered);
// //   }, [tasks, filters]);

// //   const handleAddTask = (taskData) => {
// //     const newTask = {
// //       id: Date.now(),
// //       ...taskData,
// //       completed: false,
// //       postponedCount: 0,
// //       createdAt: new Date().toISOString()
// //     };
// //     setTasks([...tasks, newTask]);
// //     setIsModalOpen(false);
// //   };

// //   const handleEditTask = (taskData) => {
// //     setTasks(tasks.map(task =>
// //       task.id === editingTask.id ? { ...task, ...taskData } : task
// //     ));
// //     setEditingTask(null);
// //     setIsModalOpen(false);
// //   };

// //   const handleDeleteTask = (taskId) => {
// //     setTasks(tasks.filter(task => task.id !== taskId));
// //   };

// //   const handleToggleComplete = (taskId) => {
// //     setTasks(tasks.map(task =>
// //       task.id === taskId ? { ...task, completed: !task.completed } : task
// //     ));
// //   };

// //   const openEditModal = (task) => {
// //     setEditingTask(task);
// //     setIsModalOpen(true);
// //   };

// //   const closeModal = () => {
// //     setIsModalOpen(false);
// //     setEditingTask(null);
// //   };

// //   const openStartModal = (task) => {
// //     setTaskToStart(task);
// //     setIsStartModalOpen(true);
// //   };

// //   const closeStartModal = () => {
// //     setIsStartModalOpen(false);
// //     setTaskToStart(null);
// //   };

// //   const handleModeSelection = (mode) => {
// //     onPlayTask(mode, taskToStart);
// //     closeStartModal();
// //   };

// //   const completedTasks = tasks.filter(task => task.completed && task.date === filters.date).length;
// //   const totalTasks = tasks.filter(task => task.date === filters.date).length;

// //   return (
// //     <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
// //       <div className="max-w-7xl mx-auto">
// //         <div className="mb-8">
// //           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
// //             <div>
// //               <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
// //                 Task Manager
// //               </h1>
// //               <p className="text-gray-500 mt-2">
// //                 {format(new Date(filters.date), 'EEEE, MMMM do, yyyy')} • {completedTasks}/{totalTasks} completed
// //               </p>
// //             </div>
            
// //             <motion.button
// //               whileHover={{ scale: 1.05 }}
// //               whileTap={{ scale: 0.95 }}
// //               onClick={() => setIsModalOpen(true)}
// //               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium flex items-center space-x-2 shadow-md w-full sm:w-auto justify-center"
// //             >
// //               <Plus className="w-5 h-5" />
// //               <span>Add Task</span>
// //             </motion.button>
// //           </div>

// //           <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// //               <div className="relative">
// //                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
// //                 <input
// //                   type="text"
// //                   placeholder="Search tasks..."
// //                   value={filters.search}
// //                   onChange={(e) => setFilters({...filters, search: e.target.value})}
// //                   className="w-full bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 />
// //               </div>

// //               <select
// //                 value={filters.energy}
// //                 onChange={(e) => setFilters({...filters, energy: e.target.value})}
// //                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //               >
// //                 <option value="all">All Energy</option>
// //                 <option value="high">High Energy</option>
// //                 <option value="medium">Medium Energy</option>
// //                 <option value="low">Low Energy</option>
// //               </select>

// //               <select
// //                 value={filters.status}
// //                 onChange={(e) => setFilters({...filters, status: e.target.value})}
// //                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //               >
// //                 <option value="all">All Tasks</option>
// //                 <option value="pending">Pending</option>
// //                 <option value="completed">Completed</option>
// //               </select>

// //               <input
// //                 type="date"
// //                 value={filters.date || ''}
// //                 onChange={(e) => setFilters({...filters, date: e.target.value})}
// //                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //               />
// //             </div>
// //           </div>
// //         </div>

// //         <AnimatePresence>
// //           {filteredTasks.length === 0 ? (
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               className="text-center py-8 sm:py-16"
// //             >
// //               <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
// //                 <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
// //               </div>
// //               <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks for this day</h3>
// //               <p className="text-gray-500 mb-6">Try adjusting your filters or create a new task</p>
// //               <button
// //                 onClick={() => setIsModalOpen(true)}
// //                 className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
// //               >
// //                 Create First Task
// //               </button>
// //             </motion.div>
// //           ) : (
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //               {filteredTasks.map((task, index) => (
// //                 <TaskCard
// //                   key={task.id}
// //                   task={task}
// //                   index={index}
// //                   onStart={openStartModal}
// //                   onEdit={openEditModal}
// //                   onDelete={handleDeleteTask}
// //                   onToggleComplete={handleToggleComplete}
// //                 />
// //               ))}
// //             </div>
// //           )}
// //         </AnimatePresence>

// //         <TaskModal
// //           isOpen={isModalOpen}
// //           onClose={closeModal}
// //           onSubmit={editingTask ? handleEditTask : handleAddTask}
// //           editingTask={editingTask}
// //         />
// //         <StartTaskModal
// //           isOpen={isStartModalOpen}
// //           onClose={closeStartModal}
// //           onSelectMode={handleModeSelection}
// //         />
// //       </div>
// //     </div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 7. Sidebar & Placeholder Content Components
// // // -----------------------------------------------------------------------------
// // // Updated SidebarItem component to handle collapsed state
// // const SidebarItem = ({ icon, text, isActive, onClick, isCollapsed }) => (
// //   <button
// //     onClick={onClick}
// //     className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200
// //       ${isActive
// //         ? 'bg-blue-500 text-white shadow-md'
// //         : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
// //       }
// //       ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'}
// //     `}
// //     title={isCollapsed ? text : ''} // Add title for tooltip on collapsed state
// //   >
// //     <span>{icon}</span>
// //     <AnimatePresence>
// //       {!isCollapsed && (
// //         <motion.span
// //           initial={{ opacity: 0, x: -10 }}
// //           animate={{ opacity: 1, x: 0 }}
// //           exit={{ opacity: 0, x: -10 }}
// //           transition={{ duration: 0.2 }}
// //           className="font-medium whitespace-nowrap"
// //         >
// //           {text}
// //         </motion.span>
// //       )}
// //     </AnimatePresence>
// //   </button>
// // );

// // const SettingsContent = () => (
// //   <div className="bg-white p-6 rounded-2xl shadow-lg">
// //     <h2 className="text-3xl font-bold text-gray-800 mb-4">Settings</h2>
// //     <p className="text-gray-600">
// //       This is the settings page where you can manage app preferences, notifications, and other customizable options.
// //     </p>
// //   </div>
// // );

// // const ProfileContent = ({ setTasks }) => {
// //   const handleResetData = () => {
// //     localStorage.removeItem('focus-app-tasks');
// //     setTasks(initialTasks);
// //     alert('All app data has been reset to default.'); // Using alert for a simple demonstration
// //   };

// //   return (
// //     <div className="bg-white p-6 rounded-2xl shadow-lg">
// //       <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>
// //       <p className="text-gray-600 mb-6">
// //         This section displays your user profile information and account details.
// //         Since this is a single-user app with local storage, you can reset all your data here.
// //       </p>
// //       <button
// //         onClick={handleResetData}
// //         className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-200"
// //       >
// //         Reset All App Data
// //       </button>
// //     </div>
// //   );
// // };

// // export default App;
// // nothing
// // "use client";
// // import React, { useState, useEffect } from 'react';
// // import { LayoutDashboard, Timer, LucideFocus, Settings, User, Menu, X, CircleCheck, ListTodo, Plus, Search, Calendar, Clock, Zap, Play, Edit, Trash2 } from 'lucide-react';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { format } from 'date-fns';

// // // -----------------------------------------------------------------------------
// // // 1. Main App Component
// // //    This is the main container for the entire application.
// // // -----------------------------------------------------------------------------
// // function App() {
// //   // State to track which section is currently active (e.g., 'dashboard', 'tasks').
// //   const [activeSection, setActiveSection] = useState('tasks');
// //   // State to control the mobile sidebar's visibility.
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   // State to control the desktop sidebar's collapsed state. This is new.
// //   const [isCollapsed, setIsCollapsed] = useState(false);

// //   // Handler to change the active section.
// //   const handleSectionChange = (section) => {
// //     setActiveSection(section);
// //     setIsSidebarOpen(false); // Close sidebar on mobile
// //   };

// //   // Helper function to render the correct content based on the active section.
// //   const renderContent = () => {
// //     switch (activeSection) {
// //       case 'dashboard':
// //         return <DashboardContent />;
// //       case 'focus':
// //         return <FocusModeContent />;
// //       case 'pomodoro':
// //         return <PomodoroContent />;
// //       case 'tasks':
// //         // Pass the handleSectionChange function to the TasksPage so it can
// //         // navigate to other sections (e.g., Pomodoro)
// //         return <TasksPage onPlayTask={() => handleSectionChange('pomodoro')} />;
// //       case 'settings':
// //         return <SettingsContent />;
// //       case 'profile':
// //         return <ProfileContent />;
// //       default:
// //         return <DashboardContent />;
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans text-gray-800">

// //       {/* Mobile menu button */}
// //       <div className="md:hidden p-4 flex justify-between items-center bg-white shadow-md">
// //         <h1 className="text-xl font-bold text-gray-800">Focus App</h1>
// //         <button
// //           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
// //           className="p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
// //         >
// //           {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
// //         </button>
// //       </div>

// //       {/* Mobile menu overlay */}
// //       {isSidebarOpen && (
// //         <div
// //           className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 md:hidden"
// //           onClick={() => setIsSidebarOpen(false)}
// //         ></div>
// //       )}

// //       {/* Sidebar Component */}
// //       <aside
// //         className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
// //         bg-white shadow-lg p-6 flex flex-col space-y-4
// //         ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
// //         ${isCollapsed ? 'md:w-20' : 'md:w-64'}
// //         md:relative md:translate-x-0 md:p-4`}
// //       >
// //         <div className="flex justify-between items-center flex-shrink-0 mb-8">
// //           {/* Main App Title, only visible when not collapsed */}
// //           {!isCollapsed && (
// //             <h1 className="text-3xl font-bold text-gray-800 tracking-tight transition-opacity duration-300">Focus App</h1>
// //           )}
// //           {/* Hamburger/Collapse button for desktop and close for mobile */}
// //           <button
// //             onClick={() => {
// //               // On desktop, toggle the collapsed state
// //               if (window.innerWidth >= 768) {
// //                 setIsCollapsed(!isCollapsed);
// //               } else {
// //                 // On mobile, toggle the sidebar's open state
// //                 setIsSidebarOpen(!isSidebarOpen);
// //               }
// //             }}
// //             className={`p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 ${isCollapsed ? 'mx-auto' : ''}`}
// //           >
// //             {isCollapsed ? <Menu size={24} /> : <X size={24} />}
// //           </button>
// //         </div>
// //         {/* Navigation links */}
// //         <nav className="flex-1 space-y-2">
// //           <SidebarItem
// //             icon={<LayoutDashboard size={20} />}
// //             text="Dashboard"
// //             isActive={activeSection === 'dashboard'}
// //             onClick={() => handleSectionChange('dashboard')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<LucideFocus size={20} />}
// //             text="Focus Mode"
// //             isActive={activeSection === 'focus'}
// //             onClick={() => handleSectionChange('focus')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<Timer size={20} />}
// //             text="Pomodoro"
// //             isActive={activeSection === 'pomodoro'}
// //             onClick={() => handleSectionChange('pomodoro')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<ListTodo size={20} />}
// //             text="Task Manager"
// //             isActive={activeSection === 'tasks'}
// //             onClick={() => handleSectionChange('tasks')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<Settings size={20} />}
// //             text="Settings"
// //             isActive={activeSection === 'settings'}
// //             onClick={() => handleSectionChange('settings')}
// //             isCollapsed={isCollapsed}
// //           />
// //           <SidebarItem
// //             icon={<User size={20} />}
// //             text="Profile"
// //             isActive={activeSection === 'profile'}
// //             onClick={() => handleSectionChange('profile')}
// //             isCollapsed={isCollapsed}
// //           />
// //         </nav>
// //       </aside>

// //       {/* Main content area */}
// //       <main className="flex-1 flex flex-col overflow-y-auto">
// //         <div className="p-4 sm:p-6 lg:p-8">
// //           {renderContent()}
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 2. Sample Initial Data
// // // -----------------------------------------------------------------------------
// // const initialTasks = [
// //   {
// //     id: 1,
// //     title: 'Complete React Components',
// //     duration: 45,
// //     energy: 'High',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: false,
// //     postponedCount: 0,
// //     priority: 'high',
// //     description: 'Build responsive task cards with animations',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 2,
// //     title: 'Design Database Schema',
// //     duration: 30,
// //     energy: 'Medium',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: false,
// //     postponedCount: 1,
// //     priority: 'medium',
// //     description: 'Create MongoDB collections for users and tasks',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 3,
// //     title: 'Review Documentation',
// //     duration: 20,
// //     energy: 'Low',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: true,
// //     postponedCount: 0,
// //     priority: 'low',
// //     description: 'Read through API documentation and examples',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 4,
// //     title: 'Team Standup Meeting',
// //     duration: 15,
// //     energy: 'Medium',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: false,
// //     postponedCount: 0,
// //     priority: 'high',
// //     description: 'Daily sync with the development team',
// //     createdAt: new Date().toISOString()
// //   },
// //   {
// //     id: 5,
// //     title: 'Implement Authentication',
// //     duration: 60,
// //     energy: 'High',
// //     date: new Date().toISOString().split('T')[0],
// //     completed: false,
// //     postponedCount: 2,
// //     priority: 'high',
// //     description: 'Add login/signup with JWT and session management',
// //     createdAt: new Date().toISOString()
// //   }
// // ];

// // // -----------------------------------------------------------------------------
// // // 3. TaskCard Component
// // // -----------------------------------------------------------------------------
// // function TaskCard({ task, index, onStart, onEdit, onDelete, onToggleComplete }) {
// //   const priorityColors = {
// //     high: 'text-red-500',
// //     medium: 'text-yellow-500',
// //     low: 'text-green-500',
// //   };

// //   const energyColors = {
// //     High: 'text-blue-500',
// //     Medium: 'text-orange-500',
// //     Low: 'text-teal-500',
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       exit={{ opacity: 0, y: -20 }}
// //       transition={{ duration: 0.3, delay: index * 0.05 }}
// //       className={`relative bg-white rounded-2xl shadow-lg p-6 border ${task.completed ? 'border-green-300' : 'border-gray-200'} hover:border-blue-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1`}
// //     >
// //       <div className="flex justify-between items-start mb-4">
// //         <h3 className={`text-lg sm:text-xl font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
// //           {task.title}
// //         </h3>
// //         <motion.button
// //           whileHover={{ scale: 1.1 }}
// //           whileTap={{ scale: 0.9 }}
// //           onClick={() => onToggleComplete(task.id)}
// //           className={`w-6 h-6 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center transition-all duration-200`}
// //         >
// //           {task.completed && (
// //             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
// //             </svg>
// //           )}
// //         </motion.button>
// //       </div>

// //       <p className={`text-sm sm:text-base text-gray-500 mb-4 ${task.completed ? 'line-through' : ''}`}>
// //         {task.description}
// //       </p>

// //       <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm mb-4">
// //         <div className="flex items-center text-gray-500">
// //           <Clock className="w-4 h-4 mr-2" />
// //           <span>{task.duration} min</span>
// //         </div>
// //         <div className="flex items-center text-gray-500">
// //           <Zap className={`w-4 h-4 mr-2 ${energyColors[task.energy]}`} />
// //           <span>{task.energy} Energy</span>
// //         </div>
// //         <div className="flex items-center text-gray-500">
// //           <Calendar className="w-4 h-4 mr-2" />
// //           <span>{format(new Date(task.date), 'MMM dd')}</span>
// //         </div>
// //         <div className="flex items-center text-gray-500">
// //           <span className={`w-2 h-2 rounded-full mr-2 ${priorityColors[task.priority] === 'text-red-500' ? 'bg-red-500' : priorityColors[task.priority] === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
// //           <span>{task.priority} Priority</span>
// //         </div>
// //       </div>

// //       <div className="flex justify-end space-x-2 mt-4">
// //         {!task.completed && (
// //           <motion.button
// //             whileHover={{ scale: 1.05 }}
// //             whileTap={{ scale: 0.95 }}
// //             onClick={onStart}
// //             className="flex items-center text-blue-500 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg"
// //             title="Start Task"
// //           >
// //             <Play className="w-5 h-5" />
// //           </motion.button>
// //         )}
// //         <motion.button
// //           whileHover={{ scale: 1.05 }}
// //           whileTap={{ scale: 0.95 }}
// //           onClick={() => onEdit(task)}
// //           className="flex items-center text-yellow-500 hover:text-yellow-600 transition-colors duration-200 p-2 rounded-lg"
// //           title="Edit Task"
// //         >
// //           <Edit className="w-5 h-5" />
// //         </motion.button>
// //         <motion.button
// //           whileHover={{ scale: 1.05 }}
// //           whileTap={{ scale: 0.95 }}
// //           onClick={() => onDelete(task.id)}
// //           className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg"
// //           title="Delete Task"
// //         >
// //           <Trash2 className="w-5 h-5" />
// //         </motion.button>
// //       </div>
// //     </motion.div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 4. TaskModal Component
// // // -----------------------------------------------------------------------------
// // function TaskModal({ isOpen, onClose, onSubmit, editingTask }) {
// //   const [title, setTitle] = useState('');
// //   const [description, setDescription] = useState('');
// //   const [duration, setDuration] = useState(30);
// //   const [energy, setEnergy] = useState('Medium');
// //   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
// //   const [priority, setPriority] = useState('medium');

// //   useEffect(() => {
// //     if (editingTask) {
// //       setTitle(editingTask.title);
// //       setDescription(editingTask.description);
// //       setDuration(editingTask.duration);
// //       setEnergy(editingTask.energy);
// //       setDate(editingTask.date);
// //       setPriority(editingTask.priority);
// //     } else {
// //       setTitle('');
// //       setDescription('');
// //       setDuration(30);
// //       setEnergy('Medium');
// //       setDate(new Date().toISOString().split('T')[0]);
// //       setPriority('medium');
// //     }
// //   }, [editingTask, isOpen]);

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     onSubmit({ title, description, duration: Number(duration), energy, date, priority });
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       exit={{ opacity: 0 }}
// //       className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
// //     >
// //       <motion.div
// //         initial={{ scale: 0.9, y: 50 }}
// //         animate={{ scale: 1, y: 0 }}
// //         exit={{ scale: 0.9, y: 50 }}
// //         className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
// //       >
// //         <button
// //           onClick={onClose}
// //           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
// //         >
// //           <X className="w-6 h-6" />
// //         </button>
// //         <h2 className="text-2xl font-bold text-gray-800 mb-6">
// //           {editingTask ? 'Edit Task' : 'Add New Task'}
// //         </h2>
// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <div>
// //             <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-1">Title</label>
// //             <input
// //               type="text"
// //               id="title"
// //               value={title}
// //               onChange={(e) => setTitle(e.target.value)}
// //               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-1">Description</label>
// //             <textarea
// //               id="description"
// //               value={description}
// //               onChange={(e) => setDescription(e.target.value)}
// //               className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
// //               rows="3"
// //             ></textarea>
// //           </div>
// //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //             <div>
// //               <label htmlFor="duration" className="block text-gray-700 text-sm font-medium mb-1">Duration (min)</label>
// //               <input
// //                 type="number"
// //                 id="duration"
// //                 value={duration}
// //                 onChange={(e) => setDuration(e.target.value)}
// //                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 min="5"
// //                 step="5"
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label htmlFor="energy" className="block text-gray-700 text-sm font-medium mb-1">Energy Required</label>
// //               <select
// //                 id="energy"
// //                 value={energy}
// //                 onChange={(e) => setEnergy(e.target.value)}
// //                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 required
// //               >
// //                 <option value="Low">Low</option>
// //                 <option value="Medium">Medium</option>
// //                 <option value="High">High</option>
// //               </select>
// //             </div>
// //           </div>
// //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //             <div>
// //               <label htmlFor="date" className="block text-gray-700 text-sm font-medium mb-1">Due Date</label>
// //               <input
// //                 type="date"
// //                 id="date"
// //                 value={date}
// //                 onChange={(e) => setDate(e.target.value)}
// //                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 required
// //               />
// //             </div>
// //             <div>
// //               <label htmlFor="priority" className="block text-gray-700 text-sm font-medium mb-1">Priority</label>
// //               <select
// //                 id="priority"
// //                 value={priority}
// //                 onChange={(e) => setPriority(e.target.value)}
// //                 className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 required
// //               >
// //                 <option value="low">Low</option>
// //                 <option value="medium">Medium</option>
// //                 <option value="high">High</option>
// //               </select>
// //             </div>
// //           </div>
// //           <motion.button
// //             whileHover={{ scale: 1.02 }}
// //             whileTap={{ scale: 0.98 }}
// //             type="submit"
// //             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
// //           >
// //             {editingTask ? 'Save Changes' : 'Add Task'}
// //           </motion.button>
// //         </form>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 5. TasksPage Component
// // // -----------------------------------------------------------------------------
// // function TasksPage({ onPlayTask }) {
// //   const [tasks, setTasks] = useState(initialTasks);
// //   const [filteredTasks, setFilteredTasks] = useState(initialTasks);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [editingTask, setEditingTask] = useState(null);
// //   const [filters, setFilters] = useState({
// //     energy: 'all',
// //     status: 'all',
// //     search: '',
// //     date: new Date().toISOString().split('T')[0]
// //   });

// //   useEffect(() => {
// //     let filtered = tasks;

// //     if (filters.energy !== 'all') {
// //       filtered = filtered.filter(task => task.energy.toLowerCase() === filters.energy.toLowerCase());
// //     }

// //     if (filters.status !== 'all') {
// //       if (filters.status === 'completed') {
// //         filtered = filtered.filter(task => task.completed);
// //       } else {
// //         filtered = filtered.filter(task => !task.completed);
// //       }
// //     }

// //     if (filters.search) {
// //       filtered = filtered.filter(task =>
// //         task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
// //         task.description.toLowerCase().includes(filters.search.toLowerCase())
// //       );
// //     }

// //     if (filters.date) {
// //         filtered = filtered.filter(task => task.date === filters.date);
// //     }

// //     setFilteredTasks(filtered);
// //   }, [tasks, filters]);

// //   const handleAddTask = (taskData) => {
// //     const newTask = {
// //       id: Date.now(),
// //       ...taskData,
// //       completed: false,
// //       postponedCount: 0,
// //       createdAt: new Date().toISOString()
// //     };
// //     setTasks([...tasks, newTask]);
// //     setIsModalOpen(false);
// //   };

// //   const handleEditTask = (taskData) => {
// //     setTasks(tasks.map(task =>
// //       task.id === editingTask.id ? { ...task, ...taskData } : task
// //     ));
// //     setEditingTask(null);
// //     setIsModalOpen(false);
// //   };

// //   const handleDeleteTask = (taskId) => {
// //     setTasks(tasks.filter(task => task.id !== taskId));
// //   };

// //   const handleToggleComplete = (taskId) => {
// //     setTasks(tasks.map(task =>
// //       task.id === taskId ? { ...task, completed: !task.completed } : task
// //     ));
// //   };

// //   const openEditModal = (task) => {
// //     setEditingTask(task);
// //     setIsModalOpen(true);
// //   };

// //   const closeModal = () => {
// //     setIsModalOpen(false);
// //     setEditingTask(null);
// //   };

// //   const completedTasks = tasks.filter(task => task.completed && task.date === filters.date).length;
// //   const totalTasks = tasks.filter(task => task.date === filters.date).length;

// //   return (
// //     <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
// //       <div className="max-w-7xl mx-auto">
// //         <div className="mb-8">
// //           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
// //             <div>
// //               <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
// //                 Task Manager
// //               </h1>
// //               <p className="text-gray-500 mt-2">
// //                 {format(new Date(filters.date), 'EEEE, MMMM do, yyyy')} • {completedTasks}/{totalTasks} completed
// //               </p>
// //             </div>
            
// //             <motion.button
// //               whileHover={{ scale: 1.05 }}
// //               whileTap={{ scale: 0.95 }}
// //               onClick={() => setIsModalOpen(true)}
// //               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium flex items-center space-x-2 shadow-md w-full sm:w-auto justify-center"
// //             >
// //               <Plus className="w-5 h-5" />
// //               <span>Add Task</span>
// //             </motion.button>
// //           </div>

// //           <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// //               <div className="relative">
// //                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
// //                 <input
// //                   type="text"
// //                   placeholder="Search tasks..."
// //                   value={filters.search}
// //                   onChange={(e) => setFilters({...filters, search: e.target.value})}
// //                   className="w-full bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 />
// //               </div>

// //               <select
// //                 value={filters.energy}
// //                 onChange={(e) => setFilters({...filters, energy: e.target.value})}
// //                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //               >
// //                 <option value="all">All Energy</option>
// //                 <option value="high">High Energy</option>
// //                 <option value="medium">Medium Energy</option>
// //                 <option value="low">Low Energy</option>
// //               </select>

// //               <select
// //                 value={filters.status}
// //                 onChange={(e) => setFilters({...filters, status: e.target.value})}
// //                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //               >
// //                 <option value="all">All Tasks</option>
// //                 <option value="pending">Pending</option>
// //                 <option value="completed">Completed</option>
// //               </select>

// //               <input
// //                 type="date"
// //                 value={filters.date || ''}
// //                 onChange={(e) => setFilters({...filters, date: e.target.value})}
// //                 className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //               />
// //             </div>
// //           </div>
// //         </div>

// //         <AnimatePresence>
// //           {filteredTasks.length === 0 ? (
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               className="text-center py-8 sm:py-16"
// //             >
// //               <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
// //                 <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
// //               </div>
// //               <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks for this day</h3>
// //               <p className="text-gray-500 mb-6">Try adjusting your filters or create a new task</p>
// //               <button
// //                 onClick={() => setIsModalOpen(true)}
// //                 className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
// //               >
// //                 Create First Task
// //               </button>
// //             </motion.div>
// //           ) : (
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
// //               {filteredTasks.map((task, index) => (
// //                 <TaskCard
// //                   key={task.id}
// //                   task={task}
// //                   index={index}
// //                   onStart={() => onPlayTask()} // Call the prop passed from the parent App component
// //                   onEdit={openEditModal}
// //                   onDelete={handleDeleteTask}
// //                   onToggleComplete={handleToggleComplete}
// //                 />
// //               ))}
// //             </div>
// //           )}
// //         </AnimatePresence>

// //         <TaskModal
// //           isOpen={isModalOpen}
// //           onClose={closeModal}
// //           onSubmit={editingTask ? handleEditTask : handleAddTask}
// //           editingTask={editingTask}
// //         />
// //       </div>
// //     </div>
// //   );
// // }

// // // -----------------------------------------------------------------------------
// // // 6. Sidebar & Placeholder Content Components
// // // -----------------------------------------------------------------------------
// // // Updated SidebarItem component to handle collapsed state
// // const SidebarItem = ({ icon, text, isActive, onClick, isCollapsed }) => (
// //   <button
// //     onClick={onClick}
// //     className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200
// //       ${isActive
// //         ? 'bg-blue-500 text-white shadow-md'
// //         : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
// //       }
// //       ${isCollapsed ? 'justify-center' : 'justify-start space-x-3'}
// //     `}
// //     title={isCollapsed ? text : ''} // Add title for tooltip on collapsed state
// //   >
// //     <span>{icon}</span>
// //     <AnimatePresence>
// //       {!isCollapsed && (
// //         <motion.span
// //           initial={{ opacity: 0, x: -10 }}
// //           animate={{ opacity: 1, x: 0 }}
// //           exit={{ opacity: 0, x: -10 }}
// //           transition={{ duration: 0.2 }}
// //           className="font-medium whitespace-nowrap"
// //         >
// //           {text}
// //         </motion.span>
// //       )}
// //     </AnimatePresence>
// //   </button>
// // );

// // const DashboardContent = () => (
// //   <div className="bg-white p-6 rounded-2xl shadow-lg">
// //     <h2 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h2>
// //     <p className="text-gray-600">
// //       This is where you could display key metrics, progress charts, and a summary of your day's tasks.
// //     </p>
// //   </div>
// // );

// // const FocusModeContent = () => (
// //   <div className="bg-white p-6 rounded-2xl shadow-lg">
// //     <h2 className="text-3xl font-bold text-gray-800 mb-4">Focus Mode</h2>
// //     <p className="text-gray-600">
// //       This section is designed to help you concentrate. It could include a task list, a distraction-free writing space, or ambient sounds.
// //     </p>
// //   </div>
// // );

// // const PomodoroContent = () => (
// //   <div className="bg-white p-6 rounded-2xl shadow-lg">
// //     <h2 className="text-3xl font-bold text-gray-800 mb-4">Pomodoro Timer</h2>
// //     <p className="text-gray-600">
// //       This section is where the Pomodoro timer will be implemented. Clicking the play button on a task will bring you here.
// //     </p>
// //   </div>
// // );

// // const SettingsContent = () => (
// //   <div className="bg-white p-6 rounded-2xl shadow-lg">
// //     <h2 className="text-3xl font-bold text-gray-800 mb-4">Settings</h2>
// //     <p className="text-gray-600">
// //       This is the settings page where you can manage app preferences, notifications, and other customizable options.
// //     </p>
// //   </div>
// // );

// // const ProfileContent = () => (
// //   <div className="bg-white p-6 rounded-2xl shadow-lg">
// //     <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>
// //     <p className="text-gray-600">
// //       This section displays your user profile information and account details.
// //     </p>
// //   </div>
// // );

// // export default App;
