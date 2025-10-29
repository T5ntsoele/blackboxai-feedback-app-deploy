// backend/models/Feedback.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

class FeedbackModel {
  constructor() {
    const dbPath = path.resolve(__dirname, '..', process.env.DB_PATH || './db/feedback.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to open database:', err.message);
      } else {
        console.log('✅ Connected to SQLite database');
        this.createTable();
      }
    });
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS Feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentName TEXT NOT NULL,
        courseCode TEXT NOT NULL,
        comments TEXT,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL
      )
    `;
    this.db.run(sql, (err) => {
      if (err) {
        console.error('Table creation error:', err.message);
      } else {
        console.log('✅ Feedback table ready');
      }
    });
  }

  // Insert new feedback
  create(feedback, callback) {
    const { studentName, courseCode, comments, rating } = feedback;
    const sql = `INSERT INTO Feedback (studentName, courseCode, comments, rating) VALUES (?, ?, ?, ?)`;
    this.db.run(sql, [studentName, courseCode, comments, rating], function (err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, ...feedback });
      }
    });
  }

  // Get all feedback
  findAll(callback) {
    const sql = `SELECT * FROM Feedback`;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }

  // (Bonus) Delete feedback by ID
  deleteById(id, callback) {
    const sql = `DELETE FROM Feedback WHERE id = ?`;
    this.db.run(sql, id, function (err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }
}

module.exports = FeedbackModel;