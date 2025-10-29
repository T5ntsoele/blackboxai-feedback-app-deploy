// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create Feedback table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS Feedback (
    id SERIAL PRIMARY KEY,
    studentName TEXT NOT NULL,
    courseCode TEXT NOT NULL,
    comments TEXT,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating table:', err.message);
  } else {
    console.log('Feedback table ready');
  }
});

// === API ENDPOINTS ===

// POST /api/feedback → Add new feedback
app.post('/api/feedback', async (req, res) => {
  const { studentName, courseCode, comments, rating } = req.body;

  // Basic validation
  if (!studentName || !courseCode || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid input: all fields required, rating must be 1–5' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Feedback (studentName, courseCode, comments, rating) VALUES ($1, $2, $3, $4) RETURNING id',
      [studentName, courseCode, comments, rating]
    );
    res.status(201).json({
      id: result.rows[0].id,
      studentName,
      courseCode,
      comments,
      rating
    });
  } catch (err) {
    console.error('Insert error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/feedback → Retrieve all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Feedback ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Select error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/feedback/:id
app.delete('/api/feedback/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM Feedback WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Delete failed' });
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

// Serve frontend in production - FIXED VERSION
if (process.env.NODE_ENV === 'production') {
  // Serve static files if frontend build exists
  const frontendPath = path.join(__dirname, '../build');
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
  console.log(`📊 Database: PostgreSQL`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
