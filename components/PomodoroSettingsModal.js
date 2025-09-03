"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function PomodoroSettingsModal({ isOpen, onClose, onSubmit, currentSettings }) {
  const [settings, setSettings] = useState(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = Math.max(1, Number(value));
    setSettings(prev => ({ ...prev, [name]: numValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-white rounded-2xl p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Custom Pomodoro Times</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="work" className="block text-gray-700 text-sm font-medium mb-1">Work (min)</label>
              <input type="number" name="work" id="work" value={settings.work} onChange={handleChange} min="1" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label htmlFor="shortBreak" className="block text-gray-700 text-sm font-medium mb-1">Short Break (min)</label>
              <input type="number" name="shortBreak" id="shortBreak" value={settings.shortBreak} onChange={handleChange} min="1" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label htmlFor="longBreak" className="block text-gray-700 text-sm font-medium mb-1">Long Break (min)</label>
              <input type="number" name="longBreak" id="longBreak" value={settings.longBreak} onChange={handleChange} min="1" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label htmlFor="sessionsUntilLongBreak" className="block text-gray-700 text-sm font-medium mb-1">Sessions for Long Break</label>
              <input type="number" name="sessionsUntilLongBreak" id="sessionsUntilLongBreak" value={settings.sessionsUntilLongBreak} onChange={handleChange} min="1" className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200">
            Save Settings
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}