// api/test-connection/route.js
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    await dbConnect();
    console.log('MongoDB connection successful');
    
    return NextResponse.json({ 
      message: 'MongoDB connection successful',
      timestamp: new Date().toISOString(),
      env: {
        hasMongoDB: !!process.env.MONGODB_URI,
        hasClerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    
    return NextResponse.json({ 
      message: 'MongoDB connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      env: {
        hasMongoDB: !!process.env.MONGODB_URI,
        hasClerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}