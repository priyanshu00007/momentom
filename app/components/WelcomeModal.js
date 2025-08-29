"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function WelcomeModal({ isOpen, onSubmit }) {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [source, setSource] = useState('');
  const [schedule, setSchedule] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, purpose, source, schedule });
  };

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
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome to Focus App!
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">Your Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3" required />
          </div>
          <div>
            <label htmlFor="purpose" className="block text-gray-700 text-sm font-medium mb-1">What do you need this app for?</label>
            <textarea id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 min-h-[60px]" required />
          </div>
          <div>
            <label htmlFor="source" className="block text-gray-700 text-sm font-medium mb-1">Where did you hear about this app?</label>
            <input type="text" id="source" value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3" required />
          </div>
          <div>
            <label htmlFor="schedule" className="block text-gray-700 text-sm font-medium mb-1">What's your daily schedule?</label>
            <textarea id="schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full bg-gray-100 border border-gray-300 rounded-lg p-3 min-h-[100px]" required />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
          >
            Get Started
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}