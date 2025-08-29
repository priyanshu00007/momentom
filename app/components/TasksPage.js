"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Search, Calendar } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import StartTaskModal from './StartTaskModal';

export default function TasksPage({ tasks, setTasks, onPlayTask, productivityLevel, setUserData }) {
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToStart, setTaskToStart] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    let filtered = tasks;

    if (productivityLevel) {
      filtered = filtered.filter(task => task.energy.toLowerCase() === productivityLevel.toLowerCase());
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => filters.status === 'completed' ? task.completed : !task.completed);
    }
    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.date) {
      filtered = filtered.filter(task => task.date === filters.date);
    }
    setFilteredTasks(filtered);
  }, [tasks, filters, productivityLevel]);

  const handleAddTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      completed: false,
      postponedCount: 0,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
  };

  const handleEditTask = (taskData) => {
    setTasks(tasks.map(task =>
      task.id === editingTask.id ? { ...task, ...taskData } : task
    ));
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleToggleComplete = (task) => {
    const isCompleting = !task.completed;
    setTasks(tasks.map(t =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    ));
    if (isCompleting) {
      setUserData(prev => ({
        ...prev,
        xp: prev.xp + 10,
        history: [...prev.history, { ...task, completedAt: new Date().toISOString() }]
      }));
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };
  const openStartModal = (task) => {
    setTaskToStart(task);
    setIsStartModalOpen(true);
  };
  const closeStartModal = () => {
    setIsStartModalOpen(false);
    setTaskToStart(null);
  };
  const handleModeSelection = (mode) => {
    onPlayTask(mode, taskToStart);
    closeStartModal();
  };

  const tasksForDay = tasks.filter(task => task.date === filters.date && (!productivityLevel || task.energy.toLowerCase() === productivityLevel.toLowerCase()));
  const completedTasks = tasksForDay.filter(task => task.completed).length;
  const totalTasks = tasksForDay.length;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Task Manager</h1>
              <p className="text-gray-500 mt-2">{format(new Date(filters.date), 'EEEE, MMMM do, yyyy')} • {completedTasks}/{totalTasks} completed</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-medium flex items-center space-x-2 shadow-md w-full sm:w-auto justify-center">
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </motion.button>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search tasks..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="w-full bg-gray-100 border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>
              <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <input type="date" value={filters.date || ''} onChange={(e) => setFilters({...filters, date: e.target.value})} className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks for this day</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or create a new task</p>
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">Create First Task</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} onStart={openStartModal} onEdit={openEditModal} onDelete={handleDeleteTask} onToggleComplete={() => handleToggleComplete(task)}/>
              ))}
            </div>
          )}
        </AnimatePresence>
        <TaskModal isOpen={isModalOpen} onClose={closeModal} onSubmit={editingTask ? handleEditTask : handleAddTask} editingTask={editingTask}/>
        <StartTaskModal isOpen={isStartModalOpen} onClose={closeStartModal} onSelectMode={handleModeSelection}/>
      </div>
    </div>
  );
}