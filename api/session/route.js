import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@clerk/nextjs/server';

export async function POST(req) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, duration, taskTitle, completedAt } = await req.json();
  const db = await connectToDatabase();

  const sessionData = {
    userId,
    type,
    duration,
    taskTitle,
    completedAt: new Date(completedAt),
  };

  await db.collection('sessions').insertOne(sessionData);
  await db.collection('users').updateOne(
    { clerkId: userId },
    {
      $inc: { totalTime: duration, totalPoints: duration * 10 },
      $push: { sessions: sessionData },
    },
    { upsert: true }
  );

  return NextResponse.json({ message: 'Session saved' }, { status: 200 });
}

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ clerkId: userId });
  return NextResponse.json({
    totalTime: user?.totalTime || 0,
    totalPoints: user?.totalPoints || 0,
    sessions: user?.sessions || [],
  }, { status: 200 });
}