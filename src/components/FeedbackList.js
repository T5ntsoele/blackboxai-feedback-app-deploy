// src/components/FeedbackList.js
import React, { useState, useEffect } from 'react';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/feedback');
      if (res.ok) {
        setFeedbacks(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await fetch(`http://localhost:5000/api/feedback/${id}`, { method: 'DELETE' });
      setFeedbacks(feedbacks.filter(f => f.id !== id));
    } catch (err) {
      alert('Failed to delete feedback');
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="section">
      <h2>📊 Feedback Dashboard</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb.id} className="feedback-item">
            <h4>{fb.studentName} — {fb.courseCode}</h4>
            <div className="rating">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</div>
            <p>{fb.comments}</p>
            <button className="btn btn-delete" onClick={() => handleDelete(fb.id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedbackList;