import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useAuthUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load or create user data when authentication state changes
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      loadOrCreateUser();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const loadOrCreateUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get existing user data
      const response = await fetch('/api/user');
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else if (response.status === 404) {
        // User doesn't exist, create new one with reset values
        await createNewUser();
      } else {
        throw new Error('Failed to load user data');
      }
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewUser = async () => {
    try {
      const newUserData = {
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName || user.firstName || 'User',
        purpose: '',
        source: '',
        schedule: '',
        avatar: user.imageUrl || '',
        desc: ''
      };

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        throw new Error('Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
    }
  };

  const updateUserData = async (updates) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        return data;
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateProgress = async (progressUpdates) => {
    try {
      const response = await fetch('/api/user/progress', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressUpdates),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        return data;
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      setError(err.message);
      throw err;
    }
  };

  const resetUserProgress = async () => {
    try {
      const resetData = {
        xp: 0,
        level: 1,
        totalFocusTime: 0,
        totalPomodoroSessions: 0,
        totalTasksCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        productivityScore: 0,
        achievements: [],
        history: [],
        dailyStats: []
      };

      const response = await fetch('/api/user/progress', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        return data;
      } else {
        throw new Error('Failed to reset progress');
      }
    } catch (err) {
      console.error('Error resetting progress:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    userData,
    loading,
    error,
    isSignedIn,
    isLoaded,
    updateUserData,
    updateProgress,
    resetUserProgress,
    refreshUser: loadOrCreateUser
  };
}
