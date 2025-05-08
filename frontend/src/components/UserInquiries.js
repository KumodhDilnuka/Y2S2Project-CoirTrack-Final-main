import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import './Inquiry.css';

const UserInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    searchTerm: ''
  });

  useEffect(() => {
    const fetchUserInquiries = async () => {
      try {
        // Get current user
        const user = authService.getCurrentUser();
        
        if (!user) {
          return;
        }
        
        // Set auth header
        authService.setAuthHeader();
        
        // Fetch inquiries for the current user
        const response = await axios.get('http://localhost:5000/api/inquiries/user');
        setInquiries(response.data);
        setFilteredInquiries(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        setLoading(false);
      }
    };

    fetchUserInquiries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, inquiries]);

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      try {
        // Set auth header for API calls
        authService.setAuthHeader();
        
        await axios.delete(`http://localhost:5000/api/inquiries/${id}`);
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

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your inquiries...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="user-inquiries-container">
        <div className="user-inquiries-header">
          <h1>My Inquiries</h1>
          <p className="inquiry-description-text">
            View and manage all your inquiries. You can create new inquiries, check status updates, and view responses from our team.
          </p>
        </div>
        
        <div className="action-bar">
          <Link to="/inquiry" className="new-inquiry-button">
            <i className="fas fa-plus"></i> Create New Inquiry
          </Link>
        </div>

        {inquiries.length === 0 && !loading && filters.status === '' && filters.searchTerm === '' ? (
          <div className="no-inquiries-message">
            <i className="fas fa-comment-alt"></i>
            <h3>No Inquiries Yet</h3>
            <p>You haven't created any inquiries yet. Click the "Create New Inquiry" button to get started.</p>
            <Link to="/inquiry" className="create-first-inquiry-button">
              <i className="fas fa-plus-circle"></i> Create Your First Inquiry
            </Link>
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
                    
                    {inquiry.responses && inquiry.responses.length > 0 && (
                      <div className="response-preview">
                        <div className="response-icon">
                          <i className="fas fa-comment-alt"></i>
                        </div>
                        <div className="response-count">
                          {inquiry.responses.length} {inquiry.responses.length === 1 ? 'response' : 'responses'}
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
      
      <Footer />
    </div>
  );
};

export default UserInquiries; 