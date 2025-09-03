"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X } from 'lucide-react';
import { SignInButton } from '@clerk/nextjs';

export default function LoginModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <LogIn className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required</h2>
            <p className="text-gray-500 mb-8">Please log in to create and manage your tasks.</p>
            <SignInButton mode="modal">
              <button className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg">
                Log In or Sign Up
              </button>
            </SignInButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
