import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminInquiries.css';
import authService from '../services/authService';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    searchTerm: ''
  });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [responseForm, setResponseForm] = useState({
    message: '',
    isInternal: false
  });

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        // Set auth header for API calls
        authService.setAuthHeader();
        
        const response = await axios.get('http://localhost:5000/api/inquiries');
        setInquiries(response.data);
        setFilteredInquiries(response.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(item => item.category))];
        setCategories(uniqueCategories);
        
        // Extract unique statuses
        const uniqueStatuses = [...new Set(response.data.map(item => item.status))];
        setStatuses(uniqueStatuses);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        toast.error('Failed to load inquiry data');
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, inquiries]);

  const applyFilters = () => {
    let filtered = [...inquiries];
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(inquiry => inquiry.category === filters.category);
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(inquiry => inquiry.status === filters.status);
    }
    
    // Apply search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(inquiry => 
        inquiry.title.toLowerCase().includes(searchLower) || 
        inquiry.description.toLowerCase().includes(searchLower) ||
        inquiry.name.toLowerCase().includes(searchLower) ||
        inquiry.email.toLowerCase().includes(searchLower)
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
      category: '',
      status: '',
      searchTerm: ''
    });
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/inquiries/${id}/status`, { status: newStatus });
      
      // Update inquiries in state
      const updatedInquiries = inquiries.map(inquiry => {
        if (inquiry._id === id) {
          return { ...inquiry, status: newStatus };
        }
        return inquiry;
      });
      
      setInquiries(updatedInquiries);
      setFilteredInquiries(filteredInquiries.map(inquiry => {
        if (inquiry._id === id) {
          return { ...inquiry, status: newStatus };
        }
        return inquiry;
      }));
      
      // Update selected inquiry if it's open
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setResponseForm({
      message: '',
      isInternal: false
    });
  };

  const closeInquiryDetails = () => {
    setSelectedInquiry(null);
  };

  const handleDeleteInquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      try {
        // Set auth header for API calls
        authService.setAuthHeader();
        
        await axios.delete(`http://localhost:5000/api/inquiries/${id}`);
        
        // Remove the inquiry from our state
        setInquiries(inquiries.filter(inquiry => inquiry._id !== id));
        setFilteredInquiries(filteredInquiries.filter(inquiry => inquiry._id !== id));
        
        // If the deleted inquiry is currently selected in the modal, close the modal
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry(null);
        }
        
        toast.success('Inquiry deleted successfully');
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        toast.error(error.response?.data?.message || 'Failed to delete inquiry');
      }
    }
  };

  const handleResponseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setResponseForm({
      ...responseForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const submitResponse = async (e) => {
    e.preventDefault();
    
    if (!responseForm.message.trim()) {
      toast.error('Response message cannot be empty');
      return;
    }
    
    try {
      const adminUser = JSON.parse(localStorage.getItem('user'));
      const responderName = adminUser?.user?.name || 'Admin';
      
      const responseData = {
        message: responseForm.message,
        responder: responderName,
        isInternal: responseForm.isInternal
      };
      
      // Add auth header for API calls
      authService.setAuthHeader();
      
      const response = await axios.post(`http://localhost:5000/api/inquiries/${selectedInquiry._id}/responses`, responseData);
      
      // Update the inquiry in our state
      const updatedInquiry = response.data;
      setSelectedInquiry(updatedInquiry);
      
      // Update inquiry lists
      const updatedInquiries = inquiries.map(inq => 
        inq._id === updatedInquiry._id ? updatedInquiry : inq
      );
      setInquiries(updatedInquiries);
      setFilteredInquiries(filteredInquiries.map(inq => 
        inq._id === updatedInquiry._id ? updatedInquiry : inq
      ));
      
      // Reset the form
      setResponseForm({
        message: '',
        isInternal: false
      });
      
      // Show appropriate toast message
      if (responseData.isInternal) {
        toast.success('Internal note added successfully');
      } else {
        toast.success('Response sent to customer successfully');
      }
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Failed to add response');
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'General':
        return 'fas fa-info-circle';
      case 'Product':
        return 'fas fa-box';
      case 'Pricing':
        return 'fas fa-tag';
      case 'Shipping':
        return 'fas fa-shipping-fast';
      case 'Other':
        return 'fas fa-question-circle';
      default:
        return 'fas fa-comment';
    }
  };

  if (loading) {
    return (
      <div className="admin-inquiries-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-inquiries-container">
      <div className="admin-header">
        <h2>Inquiry Management</h2>
        <Link to="/admin" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </Link>
      </div>
      
      {/* Stats Overview */}
      <div className="inquiries-stats">
        <div className="stat-box">
          <span className="stat-value">{inquiries.length}</span>
          <span className="stat-label">Total Inquiries</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{inquiries.filter(i => i.status === 'New').length}</span>
          <span className="stat-label">New</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{inquiries.filter(i => i.status === 'In Progress').length}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{inquiries.filter(i => i.status === 'Pending Client Response').length}</span>
          <span className="stat-label">Pending Response</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{inquiries.filter(i => i.status === 'Resolved' || i.status === 'Closed').length}</span>
          <span className="stat-label">Resolved/Closed</span>
        </div>
      </div>
      
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
            <label htmlFor="categoryFilter">Category</label>
            <select
              id="categoryFilter"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
              {statuses.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          
          <button className="reset-filters" onClick={resetFilters}>
            <i className="fas fa-undo"></i> Reset
          </button>
        </div>
      </div>
      
      {/* Inquiries Table */}
      <div className="inquiries-table-container">
        <table className="inquiries-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Subject</th>
              <th>From</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map(inquiry => (
                <tr key={inquiry._id}>
                  <td>
                    <span className="category-icon">
                      <i className={getCategoryIcon(inquiry.category)}></i>
                    </span>
                    {inquiry.category}
                  </td>
                  <td className="inquiry-title" onClick={() => handleViewInquiry(inquiry)}>
                    {inquiry.title}
                    {inquiry.responses && inquiry.responses.length > 0 && (
                      <span className="response-count">
                        <i className="fas fa-comment-dots"></i> {inquiry.responses.length}
                      </span>
                    )}
                  </td>
                  <td>
                    <div>{inquiry.name}</div>
                    <div className="email-text">{inquiry.email}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="view-button"
                      onClick={() => handleViewInquiry(inquiry)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <div className="dropdown">
                      <button className="dropdown-toggle">
                        Status <i className="fas fa-caret-down"></i>
                      </button>
                      <div className="dropdown-menu">
                        <button 
                          onClick={() => handleUpdateStatus(inquiry._id, 'New')}
                          className={inquiry.status === 'New' ? 'active' : ''}
                        >
                          New
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(inquiry._id, 'In Progress')}
                          className={inquiry.status === 'In Progress' ? 'active' : ''}
                        >
                          In Progress
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(inquiry._id, 'Pending Client Response')}
                          className={inquiry.status === 'Pending Client Response' ? 'active' : ''}
                        >
                          Pending Response
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(inquiry._id, 'Resolved')}
                          className={inquiry.status === 'Resolved' ? 'active' : ''}
                        >
                          Resolved
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(inquiry._id, 'Closed')}
                          className={inquiry.status === 'Closed' ? 'active' : ''}
                        >
                          Closed
                        </button>
                      </div>
                    </div>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteInquiry(inquiry._id)}
                      title="Delete Inquiry"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No inquiries found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="inquiry-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedInquiry.title}</h2>
              <div className="modal-header-actions">
                <button 
                  className="delete-inquiry-button" 
                  onClick={() => handleDeleteInquiry(selectedInquiry._id)}
                  title="Delete Inquiry"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
                <button className="close-button" onClick={closeInquiryDetails}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="inquiry-meta">
                <div className="meta-group">
                  <div className="meta-item">
                    <span className="meta-label">From:</span>
                    <span className="meta-value">{selectedInquiry.name} ({selectedInquiry.email})</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{selectedInquiry.category}</span>
                  </div>
                </div>
                <div className="meta-group">
                  <div className="meta-item">
                    <span className="meta-label">Date:</span>
                    <span className="meta-value">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status:</span>
                    <span className={`meta-value status-tag ${getStatusClass(selectedInquiry.status)}`}>
                      {selectedInquiry.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="inquiry-description">
                <h3>Inquiry Details</h3>
                <p>{selectedInquiry.description}</p>
              </div>
              
              {/* Responses Section */}
              {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                <div className="responses-section">
                  <h3>Responses</h3>
                  <div className="response-timeline">
                    {selectedInquiry.responses.map((response, index) => (
                      <div 
                        key={index} 
                        className={`response-item ${response.isInternal ? 'internal' : ''}`}
                      >
                        <div className="response-header">
                          <div className="responder">
                            <i className="fas fa-user-circle"></i>
                            <span>{response.responder}</span>
                            {response.isInternal && <span className="internal-badge">Internal Note</span>}
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
              
              {/* Add Response Form */}
              <div className="add-response-section">
                <h3>Add Response</h3>
                <form onSubmit={submitResponse} className="response-form">
                  <div className="form-group">
                    <textarea
                      name="message"
                      placeholder="Type your response here..."
                      rows="4"
                      value={responseForm.message}
                      onChange={handleResponseChange}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <div className="internal-note-toggle">
                      <label>
                        <input
                          type="checkbox"
                          name="isInternal"
                          checked={responseForm.isInternal}
                          onChange={handleResponseChange}
                        />
                        <span>Internal note only (not visible to customer)</span>
                      </label>
                    </div>
                    
                    <div className="response-buttons">
                      <button type="submit" className="add-response-btn">
                        <i className="fas fa-paper-plane"></i> 
                        {responseForm.isInternal ? 'Add Internal Note' : 'Send Response to Customer'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Status Update Section */}
              <div className="status-update-section">
                <h3>Update Status</h3>
                <div className="status-buttons">
                  <button
                    className={`status-btn ${selectedInquiry.status === 'New' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'New')}
                  >
                    New
                  </button>
                  <button
                    className={`status-btn ${selectedInquiry.status === 'In Progress' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'In Progress')}
                  >
                    In Progress
                  </button>
                  <button
                    className={`status-btn ${selectedInquiry.status === 'Pending Client Response' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'Pending Client Response')}
                  >
                    Pending Response
                  </button>
                  <button
                    className={`status-btn ${selectedInquiry.status === 'Resolved' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'Resolved')}
                  >
                    Resolved
                  </button>
                  <button
                    className={`status-btn ${selectedInquiry.status === 'Closed' ? 'active' : ''}`}
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'Closed')}
                  >
                    Closed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries; 