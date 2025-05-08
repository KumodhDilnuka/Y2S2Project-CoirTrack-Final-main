import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import authService from '../services/authService';
import './Inquiry.css';

const UserInquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        // Set auth header for API calls
        authService.setAuthHeader();
        
        const response = await axios.get(`http://localhost:5000/api/inquiries/${id}`);
        setInquiry(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        setError('Failed to load inquiry details');
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      try {
        // Set auth header for API calls
        authService.setAuthHeader();
        
        await axios.delete(`http://localhost:5000/api/inquiries/${id}`);
        toast.success('Inquiry deleted successfully');
        navigate('/inquiry');
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        setError(error.response?.data?.message || 'Failed to delete inquiry');
        toast.error(error.response?.data?.message || 'Failed to delete inquiry');
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'New':
        return 'status-new';
      case 'In Progress':
        return 'status-progress';
      case 'Pending Client Response':
        return 'status-pending';
      case 'Resolved':
        return 'status-resolved';
      case 'Closed':
        return 'status-closed';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading inquiry details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>{error}</p>
            <Link to="/inquiry" className="back-link">Back to My Inquiries</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div>
        <Header />
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-search"></i>
            <h3>Not Found</h3>
            <p>The inquiry you're looking for doesn't exist or has been deleted.</p>
            <Link to="/inquiry" className="back-link">Back to My Inquiries</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter out internal responses that should only be visible to admins
  const publicResponses = inquiry.responses 
    ? inquiry.responses.filter(response => !response.isInternal)
    : [];

  return (
    <div>
      <Header />
      
      <div className="inquiry-detail-container">
        <div className="inquiry-detail-header">
          <h1>{inquiry.title}</h1>
          <span className={`status-badge ${getStatusClass(inquiry.status)}`}>
            {inquiry.status}
          </span>
        </div>
        
        <div className="inquiry-metadata">
          <div className="metadata-item">
            <span className="label">Category:</span>
            <span>{inquiry.category}</span>
          </div>
          <div className="metadata-item">
            <span className="label">Created:</span>
            <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="metadata-item">
            <span className="label">Last Updated:</span>
            <span>{new Date(inquiry.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="inquiry-content">
          <h3>Description</h3>
          <div className="inquiry-description-box">
            {inquiry.description}
          </div>
        </div>
        
        {/* Display responses from staff/admins */}
        {publicResponses.length > 0 && (
          <div className="responses-section">
            <h3>Responses</h3>
            <div className="response-list">
              {publicResponses.map((response, index) => (
                <div key={index} className="response-item">
                  <div className="response-header">
                    <div className="responder">
                      <i className="fas fa-user-circle"></i>
                      <span>{response.responder}</span>
                    </div>
                    <div className="response-date">
                      {new Date(response.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="response-message">
                    {response.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Reply form will be added in the future if needed */}
        
        <div className="action-buttons">
          <Link to="/inquiry" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Inquiries
          </Link>
          <div className="right-buttons">
            <Link to={`/user/inquiries/edit/${inquiry._id}`} className="edit-button">
              <i className="fas fa-edit"></i> Edit
            </Link>
            <button onClick={handleDelete} className="delete-button">
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserInquiryDetail; 