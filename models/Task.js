import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  priority: { type: String, default: 'medium' },
  energy: { type: String, default: 'Medium' },
  date: String,
  duration: Number,
  completed: { type: Boolean, default: false },
}, {
  timestamps: true 
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);


// //  MongoDB Schema (commented out for reference)
// const mongoose = require('mongoose');

// const TaskSchema = new mongoose.Schema({
//   userId: { type: String, required: true }, // Clerk user ID

  
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//   },
//   duration: {
//     type: Number,
//     required: true,
//   },
//   energy: {
//     type: String,
//     enum: ["High", "Medium", "Low"],
//     required: true,
//   },
//   date: {
//     type: Date,
//     required: true,
//   },
//   priority: {
//     type: String,
//     enum: ["high", "medium", "low"],
//     required: true,
//   },
//   completed: {
//     type: Boolean,
//     default: false,
//   },
  
//   // Additional tracking fields
//   completedAt: Date,
//   actualDuration: Number, // Actual time spent on task
//   focusSessions: [{
//     startTime: Date,
//     endTime: Date,
//     duration: Number
//   }],
//   pomodoroSessions: [{
//     startTime: Date,
//     endTime: Date,
//     completed: Boolean
//   }],
  
//   // Progress tracking
//   progress: { type: Number, default: 0, min: 0, max: 100 }, // 0-100%
//   notes: String,
//   tags: [String]
// }, {
//   timestamps: true // Adds createdAt and updatedAt timestamps
// });

// // Index for efficient queries
// TaskSchema.index({ userId: 1 });
// TaskSchema.index({ userId: 1, completed: 1 });
// TaskSchema.index({ userId: 1, date: 1 });

// export default mongoose.models.Task || mongoose.model('Task', TaskSchema);