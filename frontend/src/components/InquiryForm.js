import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import authService from '../services/authService';
import './Inquiry.css';

const InquiryForm = () => {
  const navigate = useNavigate();
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    email: '',
    name: '',
    userId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Inquiries list state
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    searchTerm: ''
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'list'

  const categories = ['General', 'Product', 'Pricing', 'Shipping', 'Other'];

  useEffect(() => {
    // Check if user is logged in and pre-fill email and name
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.user) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.user.email,
        name: currentUser.user.name,
        userId: currentUser.user._id
      }));
      setIsLoggedIn(true);
      
      // If user is logged in, fetch their inquiries
      fetchUserInquiries();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, inquiries]);

  const fetchUserInquiries = async () => {
    try {
      // Set auth header
      authService.setAuthHeader();
      
      // Fetch inquiries for the current user
      const response = await axios.get('http://localhost:5000/api/inquiries/user');
      setInquiries(response.data);
      setFilteredInquiries(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load your inquiries');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inquiries];
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    // Apply search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredInquiries(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      searchTerm: ''
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.email || !formData.name) {
      setFormError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      // Set auth header for API calls if user is logged in
      if (isLoggedIn) {
        authService.setAuthHeader();
      }
      
      const response = await axios.post('http://localhost:5000/api/inquiries', formData);
      console.log('Inquiry submitted:', response.data);
      
      // Reset form
      setFormData({
        ...formData,
        title: '',
        description: '',
        category: '',
      });
      
      if (isLoggedIn) {
        // If user is logged in, refresh their inquiries and switch to list view
        setSuccessMessage('Your inquiry has been submitted successfully!');
        await fetchUserInquiries();
        setTimeout(() => {
          setSuccessMessage('');
          setActiveTab('list');
        }, 1500);
      } else {
        // For non-logged in users, just show success message
        setSuccessMessage('Your inquiry has been submitted successfully. We will get back to you soon!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setFormError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      try {
        // Set auth header for API calls
        authService.setAuthHeader();
        
        await axios.delete(`http://localhost:5000/api/inquiries/${id}`);
        // Update inquiries list
        setInquiries(inquiries.filter(item => item._id !== id));
        setFilteredInquiries(filteredInquiries.filter(item => item._id !== id));
        toast.success('Inquiry deleted successfully');
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        toast.error(error.response?.data?.message || 'Failed to delete inquiry');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
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

  // Render the form section
  const renderInquiryForm = () => (
    <div className="inquiry-form-container">
      {formError && (
        <div className="error-message">
          {formError}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <span>{successMessage}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="Your Name"
            disabled={isLoggedIn} // Disable if user is logged in
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            placeholder="Your Email"
            disabled={isLoggedIn} // Disable if user is logged in
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Subject</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleFormChange}
            placeholder="Inquiry Subject"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleFormChange}
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
          <label htmlFor="description">Message</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Please provide details about your inquiry"
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </div>
      </form>
    </div>
  );

  // Render the inquiries list section
  const renderInquiriesList = () => {
    if (!isLoggedIn) {
      return (
        <div className="not-logged-in-message">
          <i className="fas fa-lock"></i>
          <h3>Please log in to view your inquiries</h3>
          <p>You need to be logged in to see your inquiry history.</p>
          <div className="auth-buttons">
            <Link to="/login" className="login-button">Log In</Link>
            <Link to="/register" className="register-button">Register</Link>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your inquiries...</p>
        </div>
      );
    }

    return (
      <div className="user-inquiries-container">
        {/* Create New Inquiry Button */}
        <div className="action-bar">
          <button 
            onClick={() => setActiveTab('new')} 
            className="new-inquiry-button"
          >
            <i className="fas fa-plus"></i> Create New Inquiry
          </button>
        </div>

        {/* No Inquiries Message */}
        {inquiries.length === 0 && !loading && filters.status === '' && filters.searchTerm === '' ? (
          <div className="no-inquiries-message">
            <i className="fas fa-comment-alt"></i>
            <h3>No Inquiries Yet</h3>
            <p>You haven't created any inquiries yet. Click the "Create New Inquiry" button to get started.</p>
            <button 
              onClick={() => setActiveTab('new')} 
              className="create-first-inquiry-button"
            >
              <i className="fas fa-plus-circle"></i> Create Your First Inquiry
            </button>
          </div>
        ) : (
          <>
            {/* Filter Section */}
            <div className="filter-section">
              <h3><i className="fas fa-filter"></i> Filter Inquiries</h3>
              <div className="filter-controls">
                <div className="filter-group">
                  <label htmlFor="searchTerm">Search</label>
                  <input
                    type="text"
                    id="searchTerm"
                    name="searchTerm"
                    placeholder="Search in inquiries..."
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="statusFilter">Status</label>
                  <select
                    id="statusFilter"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Client Response">Pending Response</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                
                <button className="reset-filters" onClick={resetFilters}>
                  <i className="fas fa-undo"></i> Reset
                </button>
              </div>
            </div>
            
            {/* Inquiries List */}
            {filteredInquiries.length === 0 ? (
              <div className="no-inquiries-message">
                <i className="fas fa-search"></i>
                <h3>No inquiries found</h3>
                <p>No inquiries match your current filter criteria. Try adjusting your filters or create a new inquiry.</p>
              </div>
            ) : (
              <div className="inquiries-list">
                {filteredInquiries.map(inquiry => (
                  <div key={inquiry._id} className="inquiry-card">
                    <div className="inquiry-header">
                      <h3>{inquiry.title}</h3>
                      <span className={`status-badge ${getStatusBadgeClass(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </div>
                    
                    <div className="inquiry-details">
                      <div className="detail-item">
                        <span className="label">Category:</span>
                        <span>{inquiry.category}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Date:</span>
                        <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="inquiry-description">
                      {inquiry.description.length > 100 
                        ? `${inquiry.description.substring(0, 100)}...` 
                        : inquiry.description}
                    </div>
                    
                    {/* Response preview */}
                    {inquiry.responses && inquiry.responses.filter(r => !r.isInternal).length > 0 && (
                      <div className="response-preview">
                        <div className="response-icon">
                          <i className="fas fa-comment-alt"></i>
                        </div>
                        <div className="response-count">
                          {inquiry.responses.filter(r => !r.isInternal).length} {inquiry.responses.filter(r => !r.isInternal).length === 1 ? 'response' : 'responses'}
                        </div>
                      </div>
                    )}
                    
                    <div className="inquiry-actions">
                      <Link to={`/user/inquiries/${inquiry._id}`} className="view-btn">
                        <i className="fas fa-eye"></i> View
                      </Link>
                      <Link to={`/user/inquiries/edit/${inquiry._id}`} className="edit-btn">
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(inquiry._id)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <Header />
      
      <div className="inquiry-container">
        <div className="inquiry-header">
          <h1>Inquiries</h1>
          <p className="inquiry-description-text">
            Have questions about our coir products or services? Submit a new inquiry or manage your existing ones.
          </p>
        </div>

        {/* Tab navigation */}
        {isLoggedIn && (
          <div className="inquiry-tabs">
            <button 
              className={`tab-button ${activeTab === 'new' ? 'active' : ''}`} 
              onClick={() => setActiveTab('new')}
            >
              <i className="fas fa-plus-circle"></i> New Inquiry
            </button>
            <button 
              className={`tab-button ${activeTab === 'list' ? 'active' : ''}`} 
              onClick={() => setActiveTab('list')}
            >
              <i className="fas fa-list"></i> My Inquiries
            </button>
          </div>
        )}
        
        {/* Content based on active tab */}
        {(!isLoggedIn || activeTab === 'new') && renderInquiryForm()}
        {isLoggedIn && activeTab === 'list' && renderInquiriesList()}
      </div>
      
      <Footer />
    </div>
  );
};

export default InquiryForm; 