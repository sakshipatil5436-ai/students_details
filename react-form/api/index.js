import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Submission from './models/Submission.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-registration')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find({});
    // Format to match old localstorage format: { "topic": [ {group...} ] }
    const formatted = {};
    submissions.forEach(sub => {
      formatted[sub.projectTopic] = [sub];
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const newSub = new Submission(req.body);
    await newSub.save();
    res.status(201).json(newSub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/submissions/:topic', async (req, res) => {
  try {
    const updated = await Submission.findOneAndUpdate(
      { projectTopic: req.params.topic }, 
      req.body, 
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/submissions/:topic', async (req, res) => {
  try {
    await Submission.findOneAndDelete({ projectTopic: req.params.topic });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/submissions', async (req, res) => {
  try {
    await Submission.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
}

export default app;
