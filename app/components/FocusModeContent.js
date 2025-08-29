
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getDayOfYear } from 'date-fns';
import { LucideFocus, Pause, Play, StopCircle, Music, Flower } from 'lucide-react';

export default function FocusModeContent({ activeTask, setTasks, setUserData }) {
  const [time, setTime] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [flowersGrown, setFlowersGrown] = useState(0); // New state for tracking grown flowers, starts at 0
  const [lastSessionDay, setLastSessionDay] = useState(getDayOfYear(new Date()));
  const [message, setMessage] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const today = getDayOfYear(new Date());
    if (today !== lastSessionDay) {
      setSessionsToday(0);
      setLastSessionDay(today);
    }
  }, [lastSessionDay]);

  useEffect(() => {
    // Display one-time alert on component mount
    alert('This focus mode will only count if your timer goes above 1hr');
  }, []); // Empty dependency array ensures it runs only once

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
    setMessage('');
  };

  const handleStopAndSave = () => {
    setIsRunning(false);
    if (time >= 3600) {
      if (activeTask) {
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === activeTask.id ? { ...task, completed: true } : task
        ));
        setUserData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            xp: prev.xp + 10,
            history: [
              ...prev.history,
              {
                ...activeTask,
                completedAt: new Date().toISOString(),
                duration: Math.round(time / 60)
              }
            ]
          };
        });
      }
      setSessionsToday(prevCount => prevCount + 1);
      setFlowersGrown(prev => prev + 1); // Grow a new flower on successful session
      setMessage(`Session of ${formatTime(time)} saved successfully! A new flower has grown.`);
    } else if (time > 0) {
      setMessage('Session was under 1 hour and was not recorded.');
    }
    setTime(0);
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
      <audio ref={audioRef} loop src="https://www.dropbox.com/s/xci6pjthkc751e8/Memories%20of%20a%20Friend.mp3?raw=1" />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col items-center space-y-8"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Focus Session
        </h2>
        <div className="relative">
          <motion.div
            key={time}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-6xl sm:text-7xl font-mono font-extrabold text-blue-600 tracking-wide"
          >
            {formatTime(time)}
          </motion.div>
          <div className="text-lg text-gray-500 mt-2">
            Sessions Today: {sessionsToday}
          </div>
          <div className="text-lg text-gray-500 mt-2 flex items-center justify-center space-x-2">
            <Flower className="w-6 h-6 text-green-500" />
            <span>Flowers Grown: {flowersGrown}</span>
          </div>
          {flowersGrown > 0 && (
            <div className="flex flex-wrap justify-center mt-4 gap-2">
              {Array.from({ length: flowersGrown }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Flower className="w-8 h-8 text-green-500" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-indigo-600 font-semibold"
          >
            {message}
          </motion.p>
        )}

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartPause} className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold shadow-md transition-colors duration-200 ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
            {isRunning ? (<><Pause size={20} /><span>Pause</span></>) : (<><Play size={20} /><span>Start</span></>)}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStopAndSave} disabled={time === 0 && !isRunning} className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-semibold shadow-md transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed">
            <StopCircle size={20} />
            <span>Stop & Save</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMusic} className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 font-semibold shadow-md transition-colors duration-200">
            <Music size={20} />
            <span>{isMusicPlaying ? 'Pause Music' : 'Play Music'}</span>
          </motion.button>
        </div>
      </motion.div>

      {activeTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg mt-8 w-full max-w-lg text-left"
        >
          <div className="flex items-center space-x-3 mb-2">
            <LucideFocus className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800">Currently Focusing On</h3>
          </div>
          <p className="text-gray-700 font-medium">{activeTask.title}</p>
          <p className="text-gray-500 text-sm">{activeTask.description}</p>
        </motion.div>
      )}
    </div>
  );
}
