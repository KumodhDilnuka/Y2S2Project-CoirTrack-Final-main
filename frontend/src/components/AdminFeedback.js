import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminFeedback.css';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rating: '',
    searchTerm: ''
  });
  
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/feedback');
        const feedbackData = response.data;
        
        setFeedback(feedbackData);
        setFilteredFeedback(feedbackData);
        
        // Calculate statistics
        if (feedbackData.length > 0) {
          const sum = feedbackData.reduce((acc, item) => acc + item.rating, 0);
          const avg = sum / feedbackData.length;
          setAverageRating(parseFloat(avg.toFixed(1)));
          
          // Count ratings
          const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          feedbackData.forEach(item => {
            counts[item.rating] = (counts[item.rating] || 0) + 1;
          });
          setRatingCounts(counts);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast.error('Failed to load feedback data');
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, feedback]);

  const applyFilters = () => {
    let filtered = [...feedback];
    
    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(item => item.rating === parseInt(filters.rating));
    }
    
    // Apply search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.message.toLowerCase().includes(searchLower) || 
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredFeedback(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      rating: '',
      searchTerm: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/feedback/${id}`);
        setFeedback(feedback.filter(item => item._id !== id));
        setFilteredFeedback(filteredFeedback.filter(item => item._id !== id));
        toast.success('Feedback deleted successfully');
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Failed to delete feedback');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-feedback-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading feedback data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-feedback-container">
      <div className="admin-header">
        <h2>Feedback Management</h2>
        <Link to="/admin" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </Link>
      </div>
      
      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card average-rating">
          <h3>Average Rating</h3>
          <div className="rating-value">
            {averageRating}
            <span className="rating-max">/5</span>
          </div>
          <div className="star-display">
            {[1, 2, 3, 4, 5].map(star => (
              <i 
                key={star}
                className={`fas fa-star ${star <= Math.round(averageRating) ? 'active' : 'inactive'}`}
              ></i>
            ))}
          </div>
        </div>
        <div className="stat-card rating-distribution">
          <h3>Rating Distribution</h3>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="rating-bar-item">
                <div className="rating-label">
                  {rating} <i className="fas fa-star"></i>
                  <span className="rating-count">({ratingCounts[rating]})</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar rating-${rating}`}
                    style={{ 
                      width: `${feedback.length ? (ratingCounts[rating] / feedback.length * 100) : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="filter-section">
        <h3><i className="fas fa-filter"></i> Filter Feedback</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="searchTerm">Search</label>
            <input
              type="text"
              id="searchTerm"
              name="searchTerm"
              placeholder="Search in feedback..."
              value={filters.searchTerm}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="ratingFilter">Rating</label>
            <select
              id="ratingFilter"
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <button className="reset-filters" onClick={resetFilters}>
            <i className="fas fa-undo"></i> Reset
          </button>
        </div>
      </div>
      
      {/* Feedback Table */}
      <div className="feedback-table-container">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <div className="star-rating">
                      {[...Array(item.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="feedback-message">
                      {item.message}
                    </div>
                  </td>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(item._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No feedback found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFeedback; 