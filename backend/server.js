// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS (required for React frontend)
app.use(express.json()); // Parse JSON bodies

// Database setup
const dbPath = path.resolve(__dirname, process.env.DB_PATH || './db/feedback.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create Feedback table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS Feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentName TEXT NOT NULL,
        courseCode TEXT NOT NULL,
        comments TEXT,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL
      )
    `);
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
  db.all('SELECT * FROM Feedback', [], (err, rows) => {
    if (err) {
      console.error('Select error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// (Bonus) DELETE /api/feedback/:id
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

// Global error handler (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});