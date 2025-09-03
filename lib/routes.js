// Task routes
app.post('/api/tasks', async (req, res) => {
  try {
    const task = await createTask(pool, req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:userId', async (req, res) => {
  try {
    const tasks = await getAllTasks(pool, req.params.userId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:userId/:id', async (req, res) => {
  try {
    const task = await getTaskById(pool, req.params.id, req.params.userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:userId/:id', async (req, res) => {
  try {
    const task = await updateTask(pool, req.params.id, req.params.userId, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:userId/:id', async (req, res) => {
  try {
    const success = await deleteTask(pool, req.params.id, req.params.userId);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const user = await createUser(pool, req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await getUser(pool, req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:userId/stats', async (req, res) => {
  try {
    const user = await updateUserStats(pool, req.params.userId, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
