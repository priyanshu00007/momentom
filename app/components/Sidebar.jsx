'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutDashboard, Settings, User, LogOut, X, Zap } from 'lucide-react';
import Link from 'next/link';

// Sidebar component
// This component displays a fixed, responsive sidebar with a dark theme.
// It's designed to be animated with framer-motion for smooth transitions.
function Sidebar({ isOpen, onClose }) {
  // Navigation items with their icons, titles, and links.
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Home', icon: Home, href: '/home' },
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <AnimatePresence>
      {/* Conditionally render the sidebar and overlay if it's open */}
      {isOpen && (
        <>
          {/* Overlay for closing the sidebar on click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          />

          {/* Main Sidebar container */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/80 backdrop-blur-lg border-r border-gray-800 p-6 flex flex-col justify-between shadow-2xl md:relative md:translate-x-0"
          >
            {/* Top section: Logo and Close button */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center space-x-2">
                  {/* Logo matching the login page theme */}
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                    Spark AI
                  </h2>
                </Link>
                {/* Close button for mobile view */}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors md:hidden"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose} // Close sidebar on mobile after clicking a link
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom section: User and Logout */}
            <div className="border-t border-gray-800 pt-6 mt-6">
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">John Doe</div>
                  <div className="text-xs text-gray-500">johndoe@example.com</div>
                </div>
              </Link>
              <button
                onClick={() => console.log('Logging out...')}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 mt-2 rounded-lg text-red-400 hover:bg-gray-800 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
