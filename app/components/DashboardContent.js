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
