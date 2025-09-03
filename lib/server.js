require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const tasksRouter = require('./routes/api'); // or './routes/tasks'

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/tasks', tasksRouter);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// // backend/server.js

// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const fetch = require('node-fetch');
// require('dotenv').config();
// const dbConnect = require('./db').default;
// const { createTask, getAllTasks, getTaskById, updateTask, deleteTask } = require('../models/Task');

// const app = express();
// const port = 3000;

// // Connect to MongoDB using the modern syntax
// mongoose.connect(mongoUrl)
//   .then(() => console.log('Successfully connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));


// // --- MONGOOSE SCHEMAS ---

// // Initialize MySQL connection
// let pool;
// (async () => {
//   try {
//     pool = await dbConnect();
//     console.log('Connected to MySQL database');
//   } catch (error) {
//     console.error('Failed to connect to MySQL:', error);
//     process.exit(1);
//   }
// })();


// // User Schema: Now stores all dashboard statistics for quick retrieval
// const UserSchema = new mongoose.Schema({
//   userId: { type: String, unique: true, required: true }, // Clerk User ID is the primary key
//   name: { type: String, required: true },
//   xp: { type: Number, default: 0 },
//   history: { type: Array, default: [] }, // Stores completed task objects

//   // Dashboard Stats
//   totalFocusTime: { type: Number, default: 0 }, // In minutes
//   totalPomodoroSessions: { type: Number, default: 0 },
//   totalTasksCompleted: { type: Number, default: 0 },
//   currentStreak: { type: Number, default: 0 },
//   lastCompletionDate: Date, // To calculate streak

//   // Array to store stats for the last 7 days for the chart
//   dailyStats: [{
//     date: Date,
//     tasksCompleted: { type: Number, default: 0 },
//     focusTime: { type: Number, default: 0 }
//   }],
// });

// const User = mongoose.model('User', UserSchema);


// // --- MIDDLEWARE ---
// app.use(cors());
// app.use(bodyParser.json());


// // --- API ROUTES ---

// /**
//  * THE MAIN DASHBOARD ENDPOINT
//  * Fetches all user stats and their tasks in one call.
//  */
// app.get('/api/dashboard/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     let user = await User.findOne({ userId });

//     // If user doesn't exist, create one (e.g., first login)
//     if (!user) {
//       user = new User({ userId, name: 'New User' }); // Name can be updated later
//       await user.save();
//     }

//     const tasks = await Task.find({ userId, completed: false }).sort({ date: 1 });

//     // Calculate level on the fly based on XP. 100 XP per level.
//     const level = Math.floor(user.xp / 100) + 1;

//     // Combine user data and tasks into one response object
//     const dashboardData = {
//       userData: { ...user.toObject(), level }, // Add calculated level to the response
//       tasks,
//     };

//     res.json(dashboardData);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// /**
//  * TASKS API
//  * For Creating, Updating, and Deleting tasks.
//  */

// // Get all tasks for a user (can be used for a dedicated "All Tasks" page)
// app.get('/api/tasks/:userId', async (req, res) => {
//     try {
//         const tasks = await Task.find({ userId: req.params.userId }).sort({ date: 1 });
//         res.json(tasks);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // Create a new task
// app.post('/api/tasks', async (req, res) => {
//   try {
//     // userId must be included in the request body
//     const task = new Task(req.body);
//     await task.save();
//     res.status(201).json(task);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Update a task (e.g., edit text, or mark as complete)
// app.put('/api/tasks/:taskId', async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const updateData = req.body;
    
//     const originalTask = await Task.findById(taskId);
//     if (!originalTask) {
//         return res.status(404).json({ error: 'Task not found' });
//     }
    
//     const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

//     // --- IMPORTANT: Logic for when a task is completed ---
//     const justCompleted = updateData.completed && !originalTask.completed;
//     if (justCompleted) {
//         const user = await User.findOne({ userId: originalTask.userId });
//         if (user) {
//             // 1. Update basic stats
//             user.xp += 10;
//             user.totalTasksCompleted += 1;
//             user.totalFocusTime += originalTask.duration;
//             user.totalPomodoroSessions += 1; // Assuming 1 task = 1 session for now

//             // 2. Add to history
//             user.history.unshift(updatedTask); // Add to the beginning of the array

//             // 3. Update Streak
//             const today = new Date();
//             today.setHours(0, 0, 0, 0); // Normalize to start of day

//             const lastCompletion = user.lastCompletionDate ? new Date(user.lastCompletionDate) : null;
//             if (lastCompletion) {
//                 lastCompletion.setHours(0, 0, 0, 0); // Normalize
//                 const yesterday = new Date(today);
//                 yesterday.setDate(today.getDate() - 1);
                
//                 if (lastCompletion.getTime() === yesterday.getTime()) {
//                     user.currentStreak += 1; // It was yesterday, continue streak
//                 } else if (lastCompletion.getTime() < yesterday.getTime()) {
//                     user.currentStreak = 1; // It was before yesterday, reset streak
//                 }
//                 // If last completion was today, do nothing to the streak
//             } else {
//                 user.currentStreak = 1; // First ever completion
//             }
//             user.lastCompletionDate = new Date();

//             // 4. Update Daily Stats for the chart
//             const todayStats = user.dailyStats.find(d => new Date(d.date).setHours(0,0,0,0) === today.getTime());
//             if (todayStats) {
//                 todayStats.tasksCompleted += 1;
//                 todayStats.focusTime += originalTask.duration;
//             } else {
//                 user.dailyStats.push({ date: new Date(), tasksCompleted: 1, focusTime: originalTask.duration });
//             }
//             // Keep dailyStats to a max of 7 days
//             if (user.dailyStats.length > 7) {
//                 user.dailyStats.shift();
//             }

//             await user.save();
//         }
//     }

//     res.json(updatedTask);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


// // Delete a task
// app.delete('/api/tasks/:taskId', async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const result = await Task.findByIdAndDelete(taskId);
//     if (!result) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
//     res.json({ success: true, message: 'Task deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // --- SERVER START ---
// app.listen(port, () => {
//   console.log(`Backend server running on http://localhost:${port}`);
// });
// // // backend/server.js

// // const express = require('express');
// // const mongoose = require('mongoose');
// // const cors = require('cors');
// // const bodyParser = require('body-parser');
// // const fetch = require('node-fetch');
// // require('dotenv').config();
// // const Task = require('../models/Task');

// // const app = express();
// // const port = 3000;

// // app.use(cors());
// // app.use(bodyParser.json());

// // // 1. SECURE: Get the connection string ONLY from the .env file.
// // const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://priyanshurathod:hLxua5V_ub_cRX4@cluster0.itdaax2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// // // Check if the MONGODB_URI is provided
// // if (!mongoUrl) {
// //   console.error('FATAL ERROR: MONGODB_URI is not defined in the .env file.');
// //   process.exit(1); // Exit the application if the database string is not found
// // }

// // // 2. CLEANED UP: Connect to MongoDB without the deprecated options.
// // mongoose.connect(mongoUrl)
// //   .then(() => console.log('Successfully connected to MongoDB'))
// //   .catch(err => console.error('MongoDB connection error:', err));


// // // User Schema
// // const userSchema = new mongoose.Schema({
// //   name: { type: String, unique: true, required: true },
// //   purpose: String,
// //   source: String,
// //   schedule: String,
// //   xp: { type: Number, default: 0 },
// //   avatar: { type: String, default: '' },
// //   desc: { type: String, default: '' },
// //   history: { type: Array, default: [] },
// //   productivityLevel: { type: String, default: null }
// // });

// // const User = mongoose.model('User', userSchema);


// // // Chat with Gemini
// // app.post('/api/chat', async (req, res) => {
// //   try {
// //     const { messages } = req.body;

// //     if (!Array.isArray(messages)) {
// //       return res.status(400).json({ error: 'messages must be array' });
// //     }

// //     const contents = messages.map(m => ({
// //       role: m.role,
// //       parts: [{ text: m.content }]
// //     }));

// //     const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`;

// //     const r = await fetch(url, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'x-goog-api-key': process.env.GEMINI_API_KEY
// //       },
// //       body: JSON.stringify({ contents })
// //     });

// //     if (!r.ok) {
// //       const text = await r.text();
// //       return res.status(502).json({ error: 'Gemini API error', details: text });
// //     }

// //     const data = await r.json();
// //     const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('')
// //                   || 'No reply';

// //     res.json({ reply, raw: data });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: err.message });
// //   }
// // });


// // // Create user
// // app.post('/api/users', async (req, res) => {
// //   const { name, purpose, source, schedule } = req.body;
// //   try {
// //     let user = await User.findOne({ name });
// //     if (user) {
// //       return res.status(400).json({ error: 'User already exists' });
// //     }
// //     user = new User({ name, purpose, source, schedule });
// //     await user.save();
// //     res.status(201).json(user);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Get user profile
// // app.get('/api/users/:name', async (req, res) => {
// //   try {
// //     const user = await User.findOne({ name: req.params.name });
// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }
// //     res.json(user);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Update user profile
// // app.put('/api/users/:name', async (req, res) => {
// //   try {
// //     const user = await User.findOneAndUpdate(
// //       { name: req.params.name },
// //       req.body,
// //       { new: true, runValidators: true }
// //     );
// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }
// //     res.json(user);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Set productivity level
// // app.put('/api/users/:name/productivity', async (req, res) => {
// //   const { level } = req.body;
// //   try {
// //     const user = await User.findOneAndUpdate(
// //       { name: req.params.name },
// //       { productivityLevel: level },
// //       { new: true }
// //     );
// //     if (!user) {
// //       return res.status(404).json({ error: 'User not found' });
// //     }
// //     res.json(user);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Helper to get task collection
// // function getTaskCollection(username) {
// //   return mongoose.connection.collection(`tasks_${username}`);
// // }

// // // Get tasks
// // app.get('/api/tasks/:name', async (req, res) => {
// //   try {
// //     const collection = getTaskCollection(req.params.name);
// //     const tasks = await collection.find({}).toArray();
// //     res.json(tasks);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Add task using Task model
// // app.post('/api/tasks', async (req, res) => {
// //   try {
// //     const task = new Task(req.body);
// //     await task.save();
// //     res.status(201).json(task);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Update task
// // app.put('/api/tasks/:name/:id', async (req, res) => {
// //   const { name, id } = req.params;
// //   const updateData = req.body;
// //   try {
// //     const collection = getTaskCollection(name);
// //     const numericId = Number(id);
// //     const task = await collection.findOneAndUpdate(
// //       { id: numericId },
// //       { $set: updateData },
// //       { returnDocument: 'after' }
// //     );
// //     if (!task.value) {
// //       return res.status(404).json({ error: 'Task not found' });
// //     }
// //     if (updateData.completed && !task.lastValue.completed) {
// //       // Update user xp and history
// //       const completedTask = { ...task.value, completedAt: new Date().toISOString() };
// //       await User.findOneAndUpdate(
// //         { name },
// //         {
// //           $inc: { xp: 10 },
// //           $push: { history: completedTask }
// //         }
// //       );
// //     }
// //     res.json(task.value);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Delete task
// // app.delete('/api/tasks/:name/:id', async (req, res) => {
// //   const { name, id } = req.params;
// //   try {
// //     const collection = getTaskCollection(name);
// //     const result = await collection.deleteOne({ id: Number(id) });
// //     if (result.deletedCount === 0) {
// //       return res.status(404).json({ error: 'Task not found' });
// //     }
// //     res.json({ success: true });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // Reset user data
// // app.delete('/api/reset/:name', async (req, res) => {
// //   const { name } = req.params;
// //   try {
// //     await User.deleteOne({ name });
// //     const collection = getTaskCollection(name);
// //     await collection.drop().catch(() => {}); // Drop if exists
// //     res.json({ success: true });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // app.listen(port, () => {
// //   console.log(`Backend server running on http://localhost:${port}`);
// // });