// backend/server.js
// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();
const Task = require('../models/Task').default || require('../models/Task');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/momentom';
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  purpose: String,
  source: String,
  schedule: String,
  xp: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  desc: { type: String, default: '' },
  history: { type: Array, default: [] },
  productivityLevel: { type: String, default: null }
});

const User = mongoose.model('User', userSchema);


const fetch = require('node-fetch');

// Chat with Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body; 
    // expects: [{ role: 'user' | 'assistant', content: 'text' }, ...]

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be array' });
    }

    const contents = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`;

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({ contents })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'Gemini API error', details: text });
    }

    const data = await r.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') 
                  || 'No reply';

    res.json({ reply, raw: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Create user
app.post('/api/users', async (req, res) => {
  const { name, purpose, source, schedule } = req.body;
  try {
    let user = await User.findOne({ name });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    user = new User({ name, purpose, source, schedule });
    await user.save();
    // Tasks collection 'tasks_name' will be created automatically on first insert
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
app.get('/api/users/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put('/api/users/:name', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set productivity level
app.put('/api/users/:name/productivity', async (req, res) => {
  const { level } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { name: req.params.name },
      { productivityLevel: level },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to get task collection
function getTaskCollection(username) {
  return mongoose.connection.collection(`tasks_${username}`);
}

// Get tasks
app.get('/api/tasks/:name', async (req, res) => {
  try {
    const collection = getTaskCollection(req.params.name);
    const tasks = await collection.find({}).toArray();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add task
// Add task using Task model
app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
app.put('/api/tasks/:name/:id', async (req, res) => {
  const { name, id } = req.params;
  const updateData = req.body;
  try {
    const collection = getTaskCollection(name);
    const numericId = Number(id);
    const task = await collection.findOneAndUpdate(
      { id: numericId },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    if (!task.value) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (updateData.completed && !task.lastValue.completed) {
      // Update user xp and history
      const completedTask = { ...task.value, completedAt: new Date().toISOString() };
      await User.findOneAndUpdate(
        { name },
        {
          $inc: { xp: 10 },
          $push: { history: completedTask }
        }
      );
    }
    res.json(task.value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
app.delete('/api/tasks/:name/:id', async (req, res) => {
  const { name, id } = req.params;
  try {
    const collection = getTaskCollection(name);
    const result = await collection.deleteOne({ id: Number(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset user data
app.delete('/api/reset/:name', async (req, res) => {
  const { name } = req.params;
  try {
    await User.deleteOne({ name });
    const collection = getTaskCollection(name);
    await collection.drop().catch(() => {}); // Drop if exists
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});