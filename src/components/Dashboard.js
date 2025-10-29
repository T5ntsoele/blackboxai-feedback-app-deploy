// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/feedback');
        if (res.ok) setFeedbacks(await res.json());
      } catch (err) {
        console.error('Failed to load feedback');
      }
    };
    fetchFeedback();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await fetch(`http://localhost:5000/api/feedback/${id}`, { method: 'DELETE' });
      setFeedbacks(feedbacks.filter(f => f.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Student Feedback Dashboard</h2>
        <p>View all course feedback submissions</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="empty-state">
          <p>No feedback available. <a href="/submit" style={{color: '#3498db'}}>Submit your first feedback!</a></p>
        </div>
      ) : (
        <div className="feedback-grid">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="feedback-card">
              <h4>{fb.studentName} • {fb.courseCode}</h4>
              <div className="rating">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</div>
              <p>{fb.comments}</p>
              <button className="btn btn-delete" onClick={() => handleDelete(fb.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;