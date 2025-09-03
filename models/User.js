// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true }, // The ID from Clerk
  name: { type: String }, // User's name
  xp: { type: Number, default: 0 },
  history: { type: Array, default: [] }, // Stores recently completed tasks

  // --- Dashboard Stats ---
  totalFocusTime: { type: Number, default: 0 }, // In minutes
  totalPomodoroSessions: { type: Number, default: 0 },
  totalTasksCompleted: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  lastCompletionDate: Date, // Used to calculate the daily streak

  dailyStats: [{
    date: Date,
    tasksCompleted: { type: Number, default: 0 },
    focusTime: { type: Number, default: 0 }
  }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema({
//   // Clerk authentication ID
//   clerkId: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
  
//   // Profile information
//   purpose: String,
//   source: String,
//   schedule: String,
//   avatar: String,
//   desc: String,
  
//   // Progress tracking - all start at 0
//   xp: { type: Number, default: 0 },
//   level: { type: Number, default: 1 },
//   totalFocusTime: { type: Number, default: 0 }, // in minutes
//   totalPomodoroSessions: { type: Number, default: 0 },
//   totalTasksCompleted: { type: Number, default: 0 },
//   currentStreak: { type: Number, default: 0 },
//   longestStreak: { type: Number, default: 0 },
//   productivityScore: { type: Number, default: 0 },
  
//   // Achievement tracking
//   achievements: [{
//     id: String,
//     name: String,
//     description: String,
//     unlockedAt: Date,
//     icon: String
//   }],
  
//   // Task history
//   history: [
//     {
//       title: String,
//       completedAt: Date,
//       duration: Number,
//       type: { type: String, enum: ['focus', 'pomodoro', 'task'], default: 'task' }
//     },
//   ],
  
//   // AI Chat history
//   aiChatHistory: [{
//     timestamp: Date,
//     userMessage: String,
//     aiResponse: String,
//     context: String
//   }],
  
//   // Daily/weekly stats
//   dailyStats: [{
//     date: Date,
//     focusTime: Number,
//     tasksCompleted: Number,
//     pomodoroSessions: Number,
//     productivityScore: Number
//   }],
  
//   // User preferences
//   preferences: {
//     theme: { type: String, default: 'light' },
//     notifications: { type: Boolean, default: true },
//     autoStartBreaks: { type: Boolean, default: true },
//     productivityLevel: String
//   },
  
//   // Timestamps
//   lastActive: { type: Date, default: Date.now },
//   joinDate: { type: Date, default: Date.now }
// }, {
//   timestamps: true
// });

// // Index for efficient queries
// UserSchema.index({ clerkId: 1 });
// UserSchema.index({ email: 1 });

// // This prevents Mongoose from redefining the model every time the code is hot-reloaded.
// export default mongoose.models.User || mongoose.model('User', UserSchema);