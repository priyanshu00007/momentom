"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSubmit, editingTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [energy, setEnergy] = useState('Medium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDuration(editingTask.duration);
      setEnergy(editingTask.energy);
      setDate(editingTask.date);
      setPriority(editingTask.priority);
    } else {
      setTitle('');
      setDescription('');
      setDuration(30);
      setEnergy('Medium');
      setDate(new Date().toISOString().split('T')[0]);
      setPriority('medium');
    }
  }, [editingTask, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, duration: Number(duration), energy, date, priority });
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-1">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-1">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]" rows="3"></textarea>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-gray-700 text-sm font-medium mb-1">Duration (min)</label>
              <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="5" step="5" required />
            </div>
            <div>
              <label htmlFor="energy" className="block text-gray-700 text-sm font-medium mb-1">Energy Required</label>
              <select id="energy" value={energy} onChange={(e) => setEnergy(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-gray-700 text-sm font-medium mb-1">Due Date</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
            </div>
            <div>
              <label htmlFor="priority" className="block text-gray-700 text-sm font-medium mb-1">Priority</label>
              <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200">
            {editingTask ? 'Save Changes' : 'Add Task'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}