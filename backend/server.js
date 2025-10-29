// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/db/feedback.db' 
  : path.resolve(__dirname, './db/feedback.db');

// CREATE DATABASE DIRECTORY IF IT DOESN'T EXIST
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    // Create Feedback table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS Feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentName TEXT NOT NULL,
        courseCode TEXT NOT NULL,
        comments TEXT,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Feedback table ready');
      }
    });
  }
});

// === API ENDPOINTS ===

// POST /api/feedback → Add new feedback
app.post('/api/feedback', (req, res) => {
  const { studentName, courseCode, comments, rating } = req.body;

  // Basic validation
  if (!studentName || !courseCode || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid input: all fields required, rating must be 1–5' });
  }

  const sql = `INSERT INTO Feedback (studentName, courseCode, comments, rating) VALUES (?, ?, ?, ?)`;
  db.run(sql, [studentName, courseCode, comments, rating], function (err) {
    if (err) {
      console.error('Insert error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({
      id: this.lastID,
      studentName,
      courseCode,
      comments,
      rating
    });
  });
});

// GET /api/feedback → Retrieve all feedback
app.get('/api/feedback', (req, res) => {
  db.all('SELECT * FROM Feedback ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Select error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// DELETE /api/feedback/:id
app.delete('/api/feedback/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM Feedback WHERE id = ?', id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Delete failed' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted' });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend in production - FIXED VERSION
if (process.env.NODE_ENV === 'production') {
  // Serve static files if frontend build exists
  const frontendPath = path.join(__dirname, '../frontend/build');
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    // Handle client-side routing - exclude API routes
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }
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