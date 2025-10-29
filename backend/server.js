// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3'); // Changed to better-sqlite3
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup - UPDATED FOR RENDER
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/db/feedback.db' 
  : path.resolve(__dirname, './db/feedback.db');

// CREATE DATABASE DIRECTORY IF IT DOESN'T EXIST
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

// Initialize database with better-sqlite3
let db;
try {
  db = new Database(dbPath);
  console.log('Connected to SQLite database at:', dbPath);
  
  // Create Feedback table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS Feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentName TEXT NOT NULL,
      courseCode TEXT NOT NULL,
      comments TEXT,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Feedback table ready');
} catch (err) {
  console.error('Database initialization error:', err.message);
  process.exit(1);
}

// === API ENDPOINTS ===

// POST /api/feedback → Add new feedback
app.post('/api/feedback', (req, res) => {
  const { studentName, courseCode, comments, rating } = req.body;

  // Basic validation
  if (!studentName || !courseCode || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid input: all fields required, rating must be 1–5' });
  }

  try {
    const stmt = db.prepare(`INSERT INTO Feedback (studentName, courseCode, comments, rating) VALUES (?, ?, ?, ?)`);
    const result = stmt.run(studentName, courseCode, comments, rating);
    
    res.status(201).json({
      id: result.lastInsertRowid,
      studentName,
      courseCode,
      comments,
      rating
    });
  } catch (err) {
    console.error('Insert error:', err.message);
    return res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/feedback → Retrieve all feedback
app.get('/api/feedback', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM Feedback ORDER BY createdAt DESC');
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    console.error('Select error:', err.message);
    return res.status(500).json({ error: 'Database error' });
  }
});

// (Bonus) DELETE /api/feedback/:id
app.delete('/api/feedback/:id', (req, res) => {
  const id = req.params.id;
  try {
    const stmt = db.prepare('DELETE FROM Feedback WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error('Delete error:', err.message);
    return res.status(500).json({ error: 'Delete failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend in production (if you have a frontend build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`📊 Database location: ${dbPath}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});