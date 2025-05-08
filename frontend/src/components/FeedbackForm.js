import React, { useState } from 'react';
import axios from 'axios';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import './Feedback.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { name, email, message, rating } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingSelect = (num) => {
    setFormData({
      ...formData,
      rating: num
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      setFormError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      // Replace with your server's URL
      const response = await axios.post('http://localhost:5000/api/feedback', formData);
      setFormData({ name: '', email: '', message: '', rating: 5 });
      setSuccessMessage('Thank you for your feedback! We appreciate your input.');
      setTimeout(() => setSuccessMessage(''), 5000);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFormError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      
      <div className="feedback-container">
        <h1>Submit Feedback</h1>
        <p className="feedback-intro">We value your opinion and would love to hear about your experience with our products and services.</p>
        
        <div className="feedback-form-container">
          {formError && (
            <div className="error-message">
              {formError}
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Your Name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="Your Email"
              />
            </div>
            
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleRatingSelect(num)}
                    className={`rating-button ${rating === num ? 'active' : ''}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Your Feedback</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={message}
                onChange={handleChange}
                placeholder="Please share your thoughts with us"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FeedbackForm; 