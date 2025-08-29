// app/components/TaskCard.js
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, Zap, Calendar, Play, Edit, Trash2 } from 'lucide-react';

export default function TaskCard({ task, index, onStart, onEdit, onDelete, onToggleComplete }) {
  const priorityColors = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
  };

  const energyColors = {
    High: 'text-pink-400',
    Medium: 'text-orange-400',
    Low: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border ${task.completed ? 'border-green-600/50' : 'border-gray-800'} hover:border-blue-600 transition-all duration-200 ease-in-out transform hover:-translate-y-1`}
    >
        {/* ... component JSX from your original code */}
    </motion.div>
  );
}