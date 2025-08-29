"use client"
import React, { useState } from 'react'; // Added useState for local management
import { CircleCheck, Clock, ListTodo, TrendingDown } from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardContent({ tasks, userData }) {
  // Use authenticated user data for calculations
  const completedTasksCount = userData?.totalTasksCompleted || 0;
  const totalFocusTime = userData?.totalFocusTime || 0;
  const totalPomodoroSessions = userData?.totalPomodoroSessions || 0;
  const currentStreak = userData?.currentStreak || 0;
  const xp = userData?.xp || 0;
  const level = userData?.level || 1;

  // Use user's daily stats if available, otherwise show 0
  const weeklyData = userData?.dailyStats?.slice(0, 7).reverse().map((day, index) => ({
    name: format(subDays(new Date(), 6 - index), 'E'),
    tasksCompleted: day.tasksCompleted || 0,
    focusTime: day.focusTime || 0
  })) || [
    { name: format(subDays(new Date(), 6), 'E'), tasksCompleted: 0, focusTime: 0 },
    { name: format(subDays(new Date(), 5), 'E'), tasksCompleted: 0, focusTime: 0 },
    { name: format(subDays(new Date(), 4), 'E'), tasksCompleted: 0, focusTime: 0 },
    { name: format(subDays(new Date(), 3), 'E'), tasksCompleted: 0, focusTime: 0 },
    { name: format(subDays(new Date(), 2), 'E'), tasksCompleted: 0, focusTime: 0 },
    { name: format(subDays(new Date(), 1), 'E'), tasksCompleted: 0, focusTime: 0 },
    { name: format(new Date(), 'E'), tasksCompleted: 0, focusTime: 0 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Welcome back, {userData?.name || 'User'}!</p>
          <p className="text-xs text-gray-400">Your progress is automatically saved</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Level</p>
            <h2 className="text-3xl font-bold text-gray-800">{level}</h2>
            <p className="text-sm text-gray-500">{xp} XP</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            {level}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Focus Time</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalFocusTime} <span className="text-base text-gray-500">min</span></h2>
          </div>
          <Clock className="w-10 h-10 text-blue-500" />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Pomodoro Sessions</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalPomodoroSessions}</h2>
          </div>
          <ListTodo className="w-10 h-10 text-yellow-500" />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Current Streak</p>
            <h2 className="text-3xl font-bold text-gray-800">{currentStreak} <span className="text-base text-gray-500">days</span></h2>
          </div>
          <TrendingDown className="w-10 h-10 text-red-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Task Completion</h2>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold' }}
                itemStyle={{ color: '#1f2937' }}
                formatter={(value) => [`${value} tasks`, 'Completed']}
              />
              <Line type="monotone" dataKey="tasksCompleted" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <ul className="space-y-4">
          {userData?.history?.slice(0, 5).map((activity, index) => (
            <li key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <CircleCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-700">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.type} session</p>
              </div>
              <p className="text-sm text-gray-400 flex-shrink-0">
                {activity.completedAt ? format(new Date(activity.completedAt), 'MMM d') : 'Today'}
              </p>
            </li>
          ))}
          {(!userData?.history || userData.history.length === 0) && (
            <p className="text-gray-500 text-center">No recent activity yet. Start your productivity journey!</p>
          )}
        </ul>
      </div>
    </div>
  );
}


// "use client"
// import React, { useState, useEffect } from 'react';
// import { CircleCheck, Clock, ListTodo, TrendingDown, Zap, Target, Trophy } from 'lucide-react';
// import { format, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// export default function DashboardContent({ tasks, userData, updateProgress }) {
//   const [localTasks, setLocalTasks] = useState(tasks || []);
//   const [weeklyStats, setWeeklyStats] = useState([]);
//   const [todayStats, setTodayStats] = useState({
//     focusTime: 0,
//     tasksCompleted: 0,
//     pomodoroSessions: 0
//   });

//   // Update local tasks when props change
//   useEffect(() => {
//     setLocalTasks(tasks || []);
//   }, [tasks]);

//   // Calculate real-time statistics
//   useEffect(() => {
//     if (localTasks && localTasks.length > 0) {
//       calculateTodayStats();
//       calculateWeeklyStats();
//     }
//   }, [localTasks]);

//   const calculateTodayStats = () => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const todayTasks = localTasks.filter(task => {
//       const taskDate = new Date(task.date);
//       taskDate.setHours(0, 0, 0, 0);
//       return taskDate.getTime() === today.getTime();
//     });

//     const completedToday = todayTasks.filter(task => task.completed);
//     const focusTimeToday = completedToday.reduce((sum, task) => sum + (task.actualDuration || task.duration || 0), 0);
//     const pomodoroToday = todayTasks.filter(task => task.pomodoroSessions && task.pomodoroSessions.length > 0).length;

//     setTodayStats({
//       focusTime: focusTimeToday,
//       tasksCompleted: completedToday.length,
//       pomodoroSessions: pomodoroToday
//     });
//   };

//   const calculateWeeklyStats = () => {
//     const start = startOfWeek(new Date(), { weekStartsOn: 1 });
//     const end = endOfWeek(new Date(), { weekStartsOn: 1 });
    
//     const weekData = [];
    
//     for (let i = 0; i < 7; i++) {
//       const date = new Date(start);
//       date.setDate(start.getDate() + i);
      
//       const dayTasks = localTasks.filter(task => {
//         const taskDate = new Date(task.date);
//         return isWithinInterval(taskDate, { start: date, end: date });
//       });
      
//       const completed = dayTasks.filter(task => task.completed).length;
//       const focusTime = dayTasks
//         .filter(task => task.completed)
//         .reduce((sum, task) => sum + (task.actualDuration || task.duration || 0), 0);
      
//       weekData.push({
//         name: format(date, 'E'),
//         date: date,
//         tasksCompleted: completed,
//         focusTime: focusTime
//       });
//     }
    
//     setWeeklyStats(weekData);
//   };

//   // Get real-time metrics
//   const totalTasksCompleted = localTasks.filter(task => task.completed).length;
//   const totalFocusTime = localTasks
//     .filter(task => task.completed)
//     .reduce((sum, task) => sum + (task.actualDuration || task.duration || 0), 0);
//   const totalPomodoroSessions = localTasks
//     .filter(task => task.pomodoroSessions && task.pomodoroSessions.length > 0)
//     .reduce((sum, task) => sum + task.pomodoroSessions.length, 0);
  
//   // Calculate current streak
//   const calculateCurrentStreak = () => {
//     let streak = 0;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     for (let i = 0; i < 30; i++) {
//       const checkDate = new Date(today);
//       checkDate.setDate(today.getDate() - i);
      
//       const dayTasks = localTasks.filter(task => {
//         const taskDate = new Date(task.date);
//         taskDate.setHours(0, 0, 0, 0);
//         return taskDate.getTime() === checkDate.getTime();
//       });
      
//       const hasCompletedTask = dayTasks.some(task => task.completed);
      
//       if (hasCompletedTask) {
//         streak++;
//       } else {
//         break;
//       }
//     }
    
//     return streak;
//   };

//   const currentStreak = calculateCurrentStreak();
//   const xp = userData?.xp || 0;
//   const level = userData?.level || 1;
//   const productivityScore = Math.round((totalTasksCompleted * 10) + (totalFocusTime * 0.5) + (currentStreak * 5));

//   // Update user progress when metrics change
//   useEffect(() => {
//     if (updateProgress && userData) {
//       const progressUpdate = {
//         totalTasksCompleted,
//         totalFocusTime,
//         totalPomodoroSessions,
//         currentStreak,
//         productivityScore,
//         dailyStats: [{
//           date: new Date(),
//           focusTime: todayStats.focusTime,
//           tasksCompleted: todayStats.tasksCompleted,
//           pomodoroSessions: todayStats.pomodoroSessions,
//           productivityScore: productivityScore
//         }]
//       };
      
//       updateProgress(progressUpdate);
//     }
//   }, [totalTasksCompleted, totalFocusTime, totalPomodoroSessions, currentStreak, productivityScore, todayStats]);

//   return (
//     <div className="p-4 sm:p-6 lg:p-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
//         <div className="text-right">
//           <p className="text-sm text-gray-500">Welcome back, {userData?.name || 'User'}!</p>
//           <p className="text-xs text-gray-400">Real-time progress tracking</p>
//         </div>
//       </div>
      
//       {/* Main Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Level & XP</p>
//             <h2 className="text-3xl font-bold text-gray-800">{level}</h2>
//             <p className="text-sm text-gray-500">{xp} XP</p>
//           </div>
//           <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
//             {level}
//           </div>
//         </div>
        
//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Total Focus Time</p>
//             <h2 className="text-3xl font-bold text-gray-800">{totalFocusTime} <span className="text-base text-gray-500">min</span></h2>
//             <p className="text-sm text-gray-500">Today: {todayStats.focusTime} min</p>
//           </div>
//           <Clock className="w-10 h-10 text-blue-500" />
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Tasks Completed</p>
//             <h2 className="text-3xl font-bold text-gray-800">{totalTasksCompleted}</h2>
//             <p className="text-sm text-gray-500">Today: {todayStats.tasksCompleted}</p>
//           </div>
//           <CircleCheck className="w-10 h-10 text-green-500" />
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
//           <div>
//             <p className="text-gray-500 text-sm mb-1">Current Streak</p>
//             <h2 className="text-3xl font-bold text-gray-800">{currentStreak} <span className="text-base text-gray-500">days</span></h2>
//             <p className="text-sm text-gray-500">Keep it up!</p>
//           </div>
//           <TrendingDown className="w-10 h-10 text-red-500" />
//         </div>
//       </div>

//       {/* Secondary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <div className="flex items-center space-x-3 mb-4">
//             <Zap className="w-6 h-6 text-yellow-500" />
//             <h3 className="text-lg font-semibold text-gray-800">Productivity Score</h3>
//           </div>
//           <div className="text-center">
//             <h2 className="text-4xl font-bold text-blue-600">{productivityScore}</h2>
//             <p className="text-sm text-gray-500">Based on tasks, time & streaks</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <div className="flex items-center space-x-3 mb-4">
//             <Target className="w-6 h-6 text-purple-500" />
//             <h3 className="text-lg font-semibold text-gray-800">Pomodoro Sessions</h3>
//           </div>
//           <div className="text-center">
//             <h2 className="text-4xl font-bold text-purple-600">{totalPomodoroSessions}</h2>
//             <p className="text-sm text-gray-500">Today: {todayStats.pomodoroSessions}</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-2xl shadow-lg">
//           <div className="flex items-center space-x-3 mb-4">
//             <Trophy className="w-6 h-6 text-yellow-500" />
//             <h3 className="text-lg font-semibold text-gray-800">Achievements</h3>
//           </div>
//           <div className="text-center">
//             <h2 className="text-4xl font-bold text-yellow-600">{userData?.achievements?.length || 0}</h2>
//             <p className="text-sm text-gray-500">Unlocked so far</p>
//           </div>
//         </div>
//       </div>

//       {/* Weekly Progress Chart */}
//       <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Progress</h2>
//         <div className="w-full h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={weeklyStats}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis dataKey="name" tickLine={false} axisLine={false} />
//               <YAxis tickLine={false} axisLine={false} />
//               <Tooltip
//                 contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
//                 labelStyle={{ fontWeight: 'bold' }}
//                 formatter={(value, name) => [
//                   name === 'tasksCompleted' ? `${value} tasks` : `${value} min`,
//                   name === 'tasksCompleted' ? 'Tasks Completed' : 'Focus Time'
//                 ]}
//               />
//               <Bar dataKey="tasksCompleted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="focusTime" fill="#10b981" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="bg-white p-6 rounded-2xl shadow-lg">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
//         <ul className="space-y-4">
//           {localTasks
//             .filter(task => task.completed)
//             .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))
//             .slice(0, 5)
//             .map((task, index) => (
//               <li key={task._id || index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
//                 <CircleCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
//                 <div className="flex-1">
//                   <p className="font-semibold text-gray-700">{task.title}</p>
//                   <p className="text-sm text-gray-500">
//                     {task.actualDuration || task.duration} min • {task.priority} priority
//                   </p>
//                 </div>
//                 <p className="text-sm text-gray-400 flex-shrink-0">
//                   {task.completedAt ? format(new Date(task.completedAt), 'MMM d') : 'Today'}
//                 </p>
//               </li>
//             ))}
//           {localTasks.filter(task => task.completed).length === 0 && (
//             <p className="text-gray-500 text-center">No completed tasks yet. Start your productivity journey!</p>
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// }
