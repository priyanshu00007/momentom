import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * @desc Get the authenticated user profile
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
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("API GET /api/user Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @desc Create a new user or update the existing one
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const userData = await request.json();
    
    // Try to find existing user
    let user = await User.findOne({ clerkId: userId });

    if (user) {
      // Update existing user
      user = await User.findByIdAndUpdate(
        user._id, 
        { 
          ...userData,
          lastActive: new Date()
        }, 
        { new: true, runValidators: true }
      );
    } else {
      // Create new user with reset values
      const newUserData = {
        clerkId: userId,
        email: userData.email,
        name: userData.name,
        purpose: userData.purpose || '',
        source: userData.source || '',
        schedule: userData.schedule || '',
        avatar: userData.avatar || '',
        desc: userData.desc || '',
        // All progress values start at 0
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
        dailyStats: [],
        preferences: {
          theme: 'light',
          notifications: true,
          autoStartBreaks: true
        },
        joinDate: new Date(),
        lastActive: new Date()
      };
      
      user = await User.create(newUserData);
    }
    
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("API POST /api/user Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @desc Update user progress (XP, achievements, etc.)
 */
export async function PATCH(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const updateData = await request.json();
    
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        ...updateData,
        lastActive: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("API PATCH /api/user Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}