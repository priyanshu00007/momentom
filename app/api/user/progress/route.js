import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * @desc Update user progress (XP, achievements, stats)
 */
export async function PATCH(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const updateData = await request.json();
    
    // Get current user data
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Calculate new values
    const newData = { ...updateData };
    
    // Handle XP and level progression
    if (updateData.xp !== undefined) {
      newData.level = Math.floor(updateData.xp / 100) + 1;
    }
    
    // Handle streak calculations
    if (updateData.currentStreak !== undefined) {
      newData.longestStreak = Math.max(user.longestStreak, updateData.currentStreak);
    }
    
    // Handle daily stats
    if (updateData.dailyStats) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingDayIndex = user.dailyStats.findIndex(
        stat => stat.date.getTime() === today.getTime()
      );
      
      if (existingDayIndex >= 0) {
        // Update existing day
        user.dailyStats[existingDayIndex] = {
          ...user.dailyStats[existingDayIndex],
          ...updateData.dailyStats
        };
      } else {
        // Add new day
        user.dailyStats.push({
          date: today,
          ...updateData.dailyStats
        });
      }
      
      // Keep only last 30 days
      user.dailyStats = user.dailyStats
        .sort((a, b) => b.date - a.date)
        .slice(0, 30);
      
      newData.dailyStats = user.dailyStats;
    }
    
    // Update user with new data
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        ...newData,
        lastActive: new Date()
      },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("API PATCH /api/user/progress Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @desc Get user progress summary
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Calculate progress summary
    const progressSummary = {
      xp: user.xp,
      level: user.level,
      totalFocusTime: user.totalFocusTime,
      totalPomodoroSessions: user.totalPomodoroSessions,
      totalTasksCompleted: user.totalTasksCompleted,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      productivityScore: user.productivityScore,
      achievements: user.achievements,
      // Weekly progress
      weeklyFocusTime: user.dailyStats
        .slice(0, 7)
        .reduce((sum, day) => sum + (day.focusTime || 0), 0),
      weeklyTasksCompleted: user.dailyStats
        .slice(0, 7)
        .reduce((sum, day) => sum + (day.tasksCompleted || 0), 0),
      // Monthly progress
      monthlyFocusTime: user.dailyStats
        .slice(0, 30)
        .reduce((sum, day) => sum + (day.focusTime || 0), 0),
      monthlyTasksCompleted: user.dailyStats
        .slice(0, 30)
        .reduce((sum, day) => sum + (day.tasksCompleted || 0), 0)
    };
    
    return NextResponse.json(progressSummary, { status: 200 });
  } catch (error) {
    console.error("API GET /api/user/progress Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
