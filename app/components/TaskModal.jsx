// app/components/TaskModal.js
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
      // Reset form for new task
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
      >
        {/* ... component JSX from your original code */}
      </motion.div>
    </motion.div>
  );
}