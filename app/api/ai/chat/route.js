import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        message: 'Gemini API key not configured' 
      }, { status: 500 });
    }

    await dbConnect();
    
    const { message, context = 'productivity' } = await request.json();
    
    if (!message) {
      return NextResponse.json({ 
        message: 'Message is required' 
      }, { status: 400 });
    }

    // Create system prompt based on context
    const systemPrompt = `You are Momentom, a helpful AI productivity assistant. You help users with:
- Task management and organization
- Time management and productivity tips
- Focus techniques and study strategies
- Goal setting and progress tracking
- Work-life balance advice
- Motivation and habit building

Context: ${context}
Keep responses concise, practical, and actionable.`;

    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent([
      systemPrompt,
      message
    ]);
    const response = await fetch('/api/ai/chat');
    const aiMessage = response.text();

    // Get user to update chat history
    const user = await User.findOne({ clerkId: userId });
    
    if (user) {
      // Add to user's AI chat history
      const chatEntry = {
        timestamp: new Date(),
        userMessage: message,
        aiResponse: aiMessage,
        context: context
      };

      // Initialize chatHistory if it doesn't exist
      if (!user.aiChatHistory) {
        user.aiChatHistory = [];
      }

      // Add new chat entry
      user.aiChatHistory.push(chatEntry);

      // Keep only last 50 chat entries
      if (user.aiChatHistory.length > 50) {
        user.aiChatHistory = user.aiChatHistory.slice(-50);
      }

      // Update user's XP for using AI assistant
      user.xp = (user.xp || 0) + 5;
      user.level = Math.floor(user.xp / 100) + 1;

      await user.save();
    }

    return NextResponse.json({
      message: aiMessage,
      xpGained: 5,
      newLevel: user ? user.level : 1
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    if (error.message.includes('API key')) {
      return NextResponse.json({ 
        message: 'AI service temporarily unavailable' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to generate AI response',
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // const { userId } = await auth();
    
    // if (!userId) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    await dbConnect();
    
    const user = await User.findOne({ clerkId: userId });
    
    if (!user || !user.aiChatHistory) {
      return NextResponse.json({ chatHistory: [] });
    }

    // Return last 20 chat entries
    const recentChats = user.aiChatHistory.slice(-20);
    
    return NextResponse.json({ 
      chatHistory: recentChats 
    });

  } catch (error) {
    console.error('AI Chat History API Error:', error);
    return NextResponse.json({ 
      message: 'Failed to load chat history',
      error: error.message 
    }, { status: 500 });
  }
}
