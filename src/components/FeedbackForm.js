// src/components/FeedbackForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    courseCode: '',
    comments: '',
    rating: 1,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.courseCode.trim()) newErrors.courseCode = 'Course code is required';
    if (formData.rating < 1 || formData.rating > 5) newErrors.rating = 'Rating must be between 1 and 5';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Feedback submitted successfully!');
        navigate('/'); // Go back to dashboard
      } else {
        alert('Submission failed');
      }
    } catch (err) {
      alert('Network error. Is backend running?');
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Submit Course Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student Name</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="e.g., your name"
            />
            {errors.studentName && <div className="error">{errors.studentName}</div>}
          </div>

          <div className="form-group">
            <label>Course Code</label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              placeholder="e.g., BIWA2110"
            />
            {errors.courseCode && <div className="error">{errors.courseCode}</div>}
          </div>

          <div className="form-group">
            <label>Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Your honest feedback..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>Rating (1–5)</label>
            <select name="rating" value={formData.rating} onChange={handleChange}>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
              ))}
            </select>
            {errors.rating && <div className="error">{errors.rating}</div>}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button type="submit" className="btn">Submit Feedback</button>
            <button type="button" className="btn btn-back" onClick={() => navigate('/')}>
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
