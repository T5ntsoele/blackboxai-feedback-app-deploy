// backend/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();

module.exports = (feedbackModel) => {
  // POST /api/feedback
  router.post('/', (req, res) => {
    const { studentName, courseCode, comments, rating } = req.body;

    // Validation
    if (!studentName || !courseCode || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'All fields required. Rating must be between 1 and 5.' });
    }

    feedbackModel.create({ studentName, courseCode, comments, rating }, (err, result) => {
      if (err) {
        console.error('Create error:', err.message);
        return res.status(500).json({ error: 'Failed to save feedback' });
      }
      res.status(201).json(result);
    });
  });

  // GET /api/feedback
  router.get('/', (req, res) => {
    feedbackModel.findAll((err, feedbacks) => {
      if (err) {
        console.error('Fetch error:', err.message);
        return res.status(500).json({ error: 'Failed to retrieve feedback' });
      }
      res.json(feedbacks);
    });
  });

  // (Bonus) DELETE /api/feedback/:id
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    feedbackModel.deleteById(id, (err, deleted) => {
      if (err) {
        return res.status(500).json({ error: 'Delete failed' });
      }
      if (!deleted) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.json({ message: 'Feedback deleted successfully' });
    });
  });

  return router;
};