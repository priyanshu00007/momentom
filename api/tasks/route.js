// api/tasks/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('No userId found in auth');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connected successfully');
    
    console.log('Finding tasks for userId:', userId);
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    console.log('Found tasks:', tasks.length);
    
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("API GET /api/tasks Error:", error);
    
    // Provide more specific error messages
    if (error.name === 'MongoNetworkError') {
      return NextResponse.json({ 
        message: 'Database connection failed. Please check your MongoDB connection.',
        error: error.message 
      }, { status: 500 });
    }
    
    if (error.name === 'MongoServerSelectionError') {
      return NextResponse.json({ 
        message: 'Cannot connect to MongoDB server. Please ensure MongoDB is running.',
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to fetch tasks', 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const body = await request.json();
    const newTask = await Task.create({
      ...body,
      userId
    });
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("API POST /api/tasks Error:", error);
    return NextResponse.json({ message: 'Failed to create task', error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id, ...updateData } = await request.json();
    
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("API PUT /api/tasks Error:", error);
    return NextResponse.json({ message: 'Failed to update task', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id } = await request.json();
    
    const deletedTask = await Task.findOneAndDelete({ _id: id, userId });
    
    if (!deletedTask) {
      return NextResponse.json({ message: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("API DELETE /api/tasks Error:", error);
    return NextResponse.json({ message: 'Failed to delete task', error: error.message }, { status: 500 });
  }
}