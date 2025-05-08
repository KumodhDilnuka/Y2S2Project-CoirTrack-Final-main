import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import './Inquiry.css';
import authService from '../services/authService';

const EditUserInquiry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = ['General', 'Product', 'Pricing', 'Shipping', 'Other'];

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        // Set auth header for API calls
        authService.setAuthHeader();
        
        const response = await axios.get(`http://localhost:5000/api/inquiries/${id}`);
        const { title, description, category } = response.data;
        setFormData({ title, description, category });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        setError('Failed to load inquiry. It may have been deleted or you do not have permission to edit it.');
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Set auth header for API calls
      authService.setAuthHeader();
      
      await axios.put(`http://localhost:5000/api/inquiries/${id}`, formData);
      toast.success('Inquiry updated successfully');
      navigate('/inquiry');
    } catch (error) {
      console.error('Error updating inquiry:', error);
      setError(error.response?.data?.message || 'Failed to update inquiry. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading inquiry...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="edit-inquiry-container">
        <h1>Edit Inquiry</h1>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="inquiry-form">
          <div className="form-group">
            <label htmlFor="title">Subject</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief subject of your inquiry"
              disabled={submitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="">Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of your inquiry"
              disabled={submitting}
            ></textarea>
          </div>
          
          <div className="form-actions">
            <Link to="/inquiry" className="cancel-button">
              <i className="fas fa-times"></i> Cancel
            </Link>
            <button
              type="submit"
              className="save-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="button-spinner"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditUserInquiry; 