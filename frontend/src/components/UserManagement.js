import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import { FaUsers, FaUserCheck, FaUserShield, FaSearch, FaSyncAlt, FaArrowLeft, FaEnvelope, FaPaperPlane, FaPaperclip, FaTimes, FaPlus, FaFilePdf, FaFileExcel, FaFileDownload } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// Add styles for animations and transitions
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  @keyframes slideInRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out forwards;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .animate-pulse {
    animation: pulse 2s infinite;
  }
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Apply custom styles
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // Cleanup on component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Stats for users
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0
  });
  
  // Email state
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: [], // Array of user IDs
    manualRecipients: [], // Array of manually entered emails
    attachments: [] // Will store file objects
  });
  const [recipientType, setRecipientType] = useState('selected'); // selected, all, active, role, manual
  const [selectedRole, setSelectedRole] = useState('user');
  const [manualEmail, setManualEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Report generation state
  const [reportFilters, setReportFilters] = useState({
    reportType: 'pdf',
    statusFilter: 'all',
    roleFilter: 'all',
    dateRange: 'all'
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    // Check admin status
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.user.role !== 'admin') {
      navigate('/login');
      toast.error('Admin access required');
      return;
    }

    // Fetch all users
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await authService.getAllUsers();
      setUsers(users);
      
      // Calculate stats
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(user => user.status === 'active').length,
        adminUsers: users.filter(user => user.role === 'admin').length
      });
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      await authService.updateUserStatus(userId, newStatus);
      
      // Update the users array to reflect the status change
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      
      // Recalculate stats
      setStats({
        ...stats,
        activeUsers: newStatus === 'active' 
          ? stats.activeUsers + 1 
          : stats.activeUsers - 1
      });
      
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await authService.deleteUser(userId);
        const updatedUsers = users.filter(user => user._id !== userId);
        setUsers(updatedUsers);
        
        // Recalculate stats
        const deletedUser = users.find(user => user._id === userId);
        setStats({
          totalUsers: stats.totalUsers - 1,
          activeUsers: deletedUser.status === 'active' 
            ? stats.activeUsers - 1 
            : stats.activeUsers,
          adminUsers: deletedUser.role === 'admin'
            ? stats.adminUsers - 1
            : stats.adminUsers
        });
        
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      await authService.updateUser(updatedUser._id, updatedUser);
      
      // Update the users array with the updated user
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
      
      setShowEditModal(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter users based on search term and status filter
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Email related functions
  const openEmailModal = () => {
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    // Reset email data
    setEmailData({
      subject: '',
      message: '',
      recipients: [],
      manualRecipients: [],
      attachments: []
    });
    setRecipientType('selected');
    setSelectedRole('user');
    setManualEmail('');
  };

  const handleEmailDataChange = (e) => {
    const { name, value } = e.target;
    setEmailData({
      ...emailData,
      [name]: value
    });
  };

  const handleRecipientTypeChange = (e) => {
    const type = e.target.value;
    setRecipientType(type);
    
    // Update recipients list based on type
    let newRecipients = [];
    
    switch (type) {
      case 'all':
        newRecipients = users.map(user => user._id);
        break;
      case 'active':
        newRecipients = users.filter(user => user.status === 'active').map(user => user._id);
        break;
      case 'role':
        newRecipients = users.filter(user => user.role === selectedRole).map(user => user._id);
        break;
      case 'manual':
        // Keep manual recipients but clear system users
        setEmailData(prev => ({
          ...prev,
          recipients: []
        }));
        return;
      default:
        // For 'selected', clear the selection
        break;
    }
    
    setEmailData(prev => ({
      ...prev,
      recipients: newRecipients
    }));
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    
    // Update recipients to users with this role
    if (recipientType === 'role') {
      const newRecipients = users.filter(user => user.role === role).map(user => user._id);
      setEmailData(prev => ({
        ...prev,
        recipients: newRecipients
      }));
    }
  };

  const handleRecipientSelection = (userId) => {
    if (recipientType !== 'selected') return;
    
    setEmailData(prev => {
      const isSelected = prev.recipients.includes(userId);
      
      if (isSelected) {
        return {
          ...prev,
          recipients: prev.recipients.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          recipients: [...prev.recipients, userId]
        };
      }
    });
  };

  const handleAddManualEmail = () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (emailData.manualRecipients.includes(manualEmail)) {
      toast.warning('This email is already added');
      return;
    }
    
    setEmailData(prev => ({
      ...prev,
      manualRecipients: [...prev.manualRecipients, manualEmail]
    }));
    
    setManualEmail('');
  };

  const handleRemoveManualEmail = (email) => {
    setEmailData(prev => ({
      ...prev,
      manualRecipients: prev.manualRecipients.filter(e => e !== email)
    }));
  };

  const handleFileAttachment = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file size (limit to 5MB per file)
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length < files.length) {
      toast.warning('Some files were too large (max 5MB per file) and were not included');
    }
    
    // Add valid files to the attachments array
    setEmailData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    setEmailData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSendEmail = async () => {
    // Validation
    if (!emailData.subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    
    if (!emailData.message.trim()) {
      toast.error('Message body is required');
      return;
    }
    
    if (emailData.recipients.length === 0 && emailData.manualRecipients.length === 0) {
      toast.error('At least one recipient is required');
      return;
    }
    
    setSendingEmail(true);
    
    try {
      // Create FormData to handle file attachments
      const formData = new FormData();
      formData.append('subject', emailData.subject);
      formData.append('message', emailData.message);
      
      // Add recipients as JSON string
      formData.append('recipients', JSON.stringify(emailData.recipients));
      formData.append('manualRecipients', JSON.stringify(emailData.manualRecipients));
      
      // Add attachments
      emailData.attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      // Send email using fetch API directly 
      const token = authService.getToken();
      const response = await fetch('http://localhost:5000/api/auth/send-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      // Check for non-JSON responses (like HTML error pages)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to send email');
      }
      
      toast.success(`Email sent successfully to ${emailData.recipients.length + emailData.manualRecipients.length} recipients`);
      
      // Close modal and reset form
      closeEmailModal();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email. Make sure your backend supports this feature.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Get recipient name by ID
  const getRecipientName = (userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Get total recipient count
  const getRecipientCount = () => {
    return emailData.recipients.length + emailData.manualRecipients.length;
  };

  // Add these functions for report generation
  const openReportModal = () => {
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
  };

  const handleReportFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get filtered users for report based on filters
  const getFilteredUsersForReport = () => {
    return users.filter(user => {
      // Status filter
      if (reportFilters.statusFilter !== 'all' && user.status !== reportFilters.statusFilter) {
        return false;
      }
      
      // Role filter
      if (reportFilters.roleFilter !== 'all' && user.role !== reportFilters.roleFilter) {
        return false;
      }
      
      // Date range filter (only if we want to filter by registration date)
      if (reportFilters.dateRange !== 'all' && user.createdAt) {
        const userDate = new Date(user.createdAt);
        const now = new Date();
        
        if (reportFilters.dateRange === 'lastWeek') {
          const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (userDate < lastWeek) return false;
        } else if (reportFilters.dateRange === 'lastMonth') {
          const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (userDate < lastMonth) return false;
        }
      }
      
      return true;
    });
  };

  // Generate PDF report
  const generatePDFReport = () => {
    setGeneratingReport(true);
    
    try {
      const filteredUsers = getFilteredUsersForReport();
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Define theme colors for a professional look
      const colors = {
        primary: [24, 100, 171],     // Deep blue
        secondary: [60, 141, 188],   // Medium blue
        accent: [0, 128, 0],         // Green accent
        lightGray: [240, 240, 240],  // Light gray for alternating rows
        darkGray: [85, 85, 85],      // Dark gray for text
        white: [255, 255, 255]       // White
      };
      
      // Add header with system name and styling
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, 297, 20, 'F');
      
      // Add accent line under header
      doc.setFillColor(...colors.accent);
      doc.rect(0, 20, 297, 2, 'F');
      
      // Add header text
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('CoirTrack', 15, 13);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Business Management System', 60, 13);
      
      // Add report title section
      doc.setFillColor(...colors.lightGray);
      doc.rect(0, 25, 297, 15, 'F');
      
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('User Management Report', 15, 34);
      
      // Add generated date and page number in header
      doc.setTextColor(...colors.darkGray);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const dateText = `Generated: ${new Date().toLocaleString()}`;
      doc.text(dateText, 270, 34, { align: 'right' });
      
      // Filter description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let filterText = `Filters: Status - ${reportFilters.statusFilter}, Role - ${reportFilters.roleFilter}`;
      if (reportFilters.dateRange !== 'all') {
        filterText += `, Time Range - ${reportFilters.dateRange}`;
      }
      doc.text(filterText, 15, 45);
      
      // Summary statistics
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Users: ${filteredUsers.length}`, 15, 52);
      const activeCount = filteredUsers.filter(user => user.status === 'active').length;
      doc.text(`Active Users: ${activeCount}`, 70, 52);
      const adminCount = filteredUsers.filter(user => user.role === 'admin').length;
      doc.text(`Admin Users: ${adminCount}`, 125, 52);
      
      // Add table headers background
      doc.setFillColor(...colors.secondary);
      doc.rect(15, 60, 267, 8, 'F');
      
      // Table headers with white text
      doc.setTextColor(...colors.white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      const headers = ["Name", "Email", "Phone", "Role", "Status", "Joined Date"];
      const columnWidths = [50, 70, 40, 30, 30, 40];
      let xPos = 20;
      
      headers.forEach((header, i) => {
        doc.text(header, xPos, 65);
        xPos += columnWidths[i];
      });
      
      // Add table data with alternating row colors
      doc.setFont('helvetica', 'normal');
      let yPos = 75;
      let alternateRow = false;
      
      filteredUsers.forEach((user, index) => {
        // Draw alternating row backgrounds
        if (alternateRow) {
          doc.setFillColor(...colors.lightGray);
          doc.rect(15, yPos - 5, 267, 8, 'F');
        }
        alternateRow = !alternateRow;
        
        // Set text color for data
        doc.setTextColor(...colors.darkGray);
        
        // Cell data
        let xPosData = 20;
        
        // Name
        doc.text(user.name || 'N/A', xPosData, yPos);
        xPosData += columnWidths[0];
        
        // Email (truncated if needed)
        const email = user.email?.length > 35 ? user.email.substring(0, 33) + '...' : (user.email || 'N/A');
        doc.text(email, xPosData, yPos);
        xPosData += columnWidths[1];
        
        // Phone
        doc.text(user.phone || 'N/A', xPosData, yPos);
        xPosData += columnWidths[2];
        
        // Role (capitalized)
        doc.text(user.role?.charAt(0)?.toUpperCase() + user.role?.slice(1) || 'N/A', xPosData, yPos);
        xPosData += columnWidths[3];
        
        // Status (capitalized)
        doc.text(user.status?.charAt(0)?.toUpperCase() + user.status?.slice(1) || 'active', xPosData, yPos);
        xPosData += columnWidths[4];
        
        // Joined date
        const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
        doc.text(joinedDate, xPosData, yPos);
        
        yPos += 10;
        
        // Add a new page if we're reaching the bottom
        if (yPos > 180) {
          doc.addPage();
          
          // Add header to new page
          doc.setFillColor(...colors.primary);
          doc.rect(0, 0, 297, 20, 'F');
          
          doc.setFillColor(...colors.accent);
          doc.rect(0, 20, 297, 2, 'F');
          
          // Table headers on new page
          doc.setFillColor(...colors.secondary);
          doc.rect(15, 30, 267, 8, 'F');
          
          doc.setTextColor(...colors.white);
          doc.setFont('helvetica', 'bold');
          
          let xPosHeader = 20;
          headers.forEach((header, i) => {
            doc.text(header, xPosHeader, 35);
            xPosHeader += columnWidths[i];
          });
          
          yPos = 45;
          alternateRow = false;
        }
      });
      
      // Add footer with page count
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(...colors.darkGray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${pageCount}`, 150, 200, { align: 'center' });
      }
      
      // Save the PDF
      doc.save(`user_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast.success('PDF Report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setGeneratingReport(false);
      closeReportModal();
    }
  };

  // Generate CSV/Excel report
  const generateCSVReport = () => {
    setGeneratingReport(true);
    
    try {
      const filteredUsers = getFilteredUsersForReport();
      
      const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
        'Name': user.name || '',
        'Email': user.email || '',
        'Phone': user.phone || '',
        'Role': user.role || '',
        'Status': user.status || 'active',
        'Joined Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
      })));
      
      // Add a title row
      XLSX.utils.sheet_add_aoa(worksheet, [['CoirTrack - User Management Report']], { origin: 'A1' });
      XLSX.utils.sheet_add_aoa(worksheet, [[`Generated on: ${new Date().toLocaleString()}`]], { origin: 'A2' });
      
      // Filter information
      XLSX.utils.sheet_add_aoa(worksheet, [[`Filters: Status - ${reportFilters.statusFilter}, Role - ${reportFilters.roleFilter}, Date Range - ${reportFilters.dateRange}`]], { origin: 'A3' });
      
      // Summary statistics
      XLSX.utils.sheet_add_aoa(worksheet, [[`Total Users: ${filteredUsers.length}`]], { origin: 'A4' });
      
      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 10 }, // Role
        { wch: 10 }, // Status
        { wch: 15 }, // Joined Date
      ];
      
      worksheet['!cols'] = columnWidths;
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      XLSX.writeFile(workbook, `user_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      toast.success('CSV Report generated successfully');
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast.error('Failed to generate CSV report');
    } finally {
      setGeneratingReport(false);
      closeReportModal();
    }
  };

  const handleGenerateReport = () => {
    if (reportFilters.reportType === 'pdf') {
      generatePDFReport();
    } else {
      generateCSVReport();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-100 hover:shadow-md transition-all duration-200"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={openEmailModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 hover:shadow transition-all duration-200"
            >
              <FaEnvelope className="text-white" /> Email Users
            </button>
            <button
              onClick={openReportModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all duration-200"
            >
              <FaFileDownload className="text-white" /> Generate Report
            </button>
          </div>
        </div>
        
        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h6 className="text-sm font-medium mb-1 text-blue-100">Total Users</h6>
                <h2 className="text-3xl font-bold text-white">{stats.totalUsers}</h2>
              </div>
              <div className="rounded-full bg-blue-400 bg-opacity-30 p-3">
                <FaUsers className="text-3xl text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h6 className="text-sm font-medium mb-1 text-green-100">Active Users</h6>
                <h2 className="text-3xl font-bold text-white">{stats.activeUsers}</h2>
              </div>
              <div className="rounded-full bg-green-400 bg-opacity-30 p-3">
                <FaUserCheck className="text-3xl text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h6 className="text-sm font-medium mb-1 text-purple-100">Admin Users</h6>
                <h2 className="text-3xl font-bold text-white">{stats.adminUsers}</h2>
              </div>
              <div className="rounded-full bg-purple-400 bg-opacity-30 p-3">
                <FaUserShield className="text-3xl text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and filter controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
            
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all duration-200"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
        
        {/* User list */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {recipientType === 'selected' && (
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user._id} className={`${user.status === 'disabled' ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors duration-150`}>
                        {recipientType === 'selected' && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={emailData.recipients.includes(user._id)}
                              onChange={() => handleRecipientSelection(user._id)}
                              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusChange(user._id, user.status || 'active')}
                              className={`${user.status === 'active' ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'} transition-colors duration-150`}
                            >
                              {user.status === 'active' ? 'Disable' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={recipientType === 'selected' ? 6 : 5} className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <FaUsers className="text-gray-400 text-3xl" />
                          <p>No users found matching your search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={currentUser?.name || ''}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  placeholder="Full Name"
                />
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={currentUser?.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Role
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  value={currentUser?.role || 'user'}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Status
                </label>
                <div className="flex justify-between gap-4">
                  <div 
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer ${
                      (currentUser?.status || 'active') === 'active' 
                        ? 'bg-green-50 border-green-500 text-green-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentUser({...currentUser, status: 'active'})}
                  >
                    <FaUserCheck className={`${(currentUser?.status || 'active') === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                    <span>Active</span>
                  </div>
                  <div 
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer ${
                      (currentUser?.status || 'active') === 'disabled' 
                        ? 'bg-red-50 border-red-500 text-red-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentUser({...currentUser, status: 'disabled'})}
                  >
                    <FaTimes className={`${(currentUser?.status || 'active') === 'disabled' ? 'text-red-500' : 'text-gray-400'}`} />
                    <span>Disabled</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUser(currentUser)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl m-4 transform transition-all animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaEnvelope className="text-green-600" /> Send Email to Users
                </h2>
                <button 
                  onClick={closeEmailModal}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Recipients */}
                <div className="md:col-span-1">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaUsers className="text-blue-600" /> Recipients
                    </h3>
                    
                    <div className="mb-5">
                      <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Recipient Type
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        value={recipientType}
                        onChange={handleRecipientTypeChange}
                      >
                        <option value="selected">Selected Users</option>
                        <option value="all">All Users</option>
                        <option value="active">Active Users</option>
                        <option value="role">By Role</option>
                        <option value="manual">Manual Entries</option>
                      </select>
                    </div>
                    
                    {recipientType === 'role' && (
                      <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          Role
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                          value={selectedRole}
                          onChange={handleRoleChange}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    )}
                    
                    {recipientType === 'manual' && (
                      <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                          Add Email Address
                        </label>
                        <div className="flex">
                          <input
                            type="email"
                            className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="email@example.com"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                          />
                          <button
                            onClick={handleAddManualEmail}
                            className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                          >
                            <FaPlus />
                          </button>
                        </div>
                        
                        {/* Display manual recipients */}
                        {emailData.manualRecipients.length > 0 && (
                          <div className="mt-4 max-h-48 overflow-y-auto bg-white rounded-lg border border-gray-200">
                            <ul className="divide-y divide-gray-200">
                              {emailData.manualRecipients.map((email, index) => (
                                <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                                  <span className="text-sm font-medium text-gray-700">{email}</span>
                                  <button 
                                    onClick={() => handleRemoveManualEmail(email)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    <FaTimes />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Display selected recipients */}
                    {recipientType !== 'manual' && emailData.recipients.length > 0 && (
                      <div className="mt-5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">Selected Recipients</span>
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {emailData.recipients.length}
                          </span>
                        </div>
                        
                        {recipientType === 'selected' && (
                          <div className="max-h-48 overflow-y-auto bg-white rounded-lg border border-gray-200">
                            <ul className="divide-y divide-gray-200">
                              {emailData.recipients.map(userId => (
                                <li key={userId} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                                  <span className="text-sm font-medium text-gray-700">{getRecipientName(userId)}</span>
                                  <button 
                                    onClick={() => handleRecipientSelection(userId)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    <FaTimes />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-blue-800">Total Recipients:</span>
                        <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">{getRecipientCount()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Email Content */}
                <div className="md:col-span-2">
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Email subject"
                      value={emailData.subject}
                      onChange={handleEmailDataChange}
                    />
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Write your message here..."
                      value={emailData.message}
                      onChange={handleEmailDataChange}
                    ></textarea>
                  </div>
                  
                  <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Attachments
                    </label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        className="hidden"
                        onChange={handleFileAttachment}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
                      >
                        <FaPaperclip /> Add Files
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        Max 5MB per file
                      </span>
                    </div>
                    
                    {/* Display attachments */}
                    {emailData.attachments.length > 0 && (
                      <div className="mt-4 bg-white rounded-lg border border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          {emailData.attachments.map((file, index) => (
                            <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                              <div className="flex items-center">
                                <FaPaperclip className="text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-700">
                                  {file.name} <span className="text-gray-500 text-xs ml-1">({(file.size / 1024).toFixed(1)} KB)</span>
                                </span>
                              </div>
                              <button 
                                onClick={() => handleRemoveAttachment(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <FaTimes />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button
                      onClick={closeEmailModal}
                      className="px-5 py-2.5 mr-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail || getRecipientCount() === 0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane /> Send Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Report Generation Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaFileDownload className="text-blue-600" /> Generate Report
                </h2>
                <button 
                  onClick={closeReportModal}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                      reportFilters.reportType === 'pdf' 
                        ? 'bg-red-50 border-red-400 shadow-sm' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setReportFilters({...reportFilters, reportType: 'pdf'})}
                  >
                    <FaFilePdf className={`text-3xl ${reportFilters.reportType === 'pdf' ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`font-medium ${reportFilters.reportType === 'pdf' ? 'text-red-700' : 'text-gray-700'}`}>PDF</span>
                  </div>
                  <div 
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                      reportFilters.reportType === 'csv' 
                        ? 'bg-green-50 border-green-400 shadow-sm' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setReportFilters({...reportFilters, reportType: 'csv'})}
                  >
                    <FaFileExcel className={`text-3xl ${reportFilters.reportType === 'csv' ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={`font-medium ${reportFilters.reportType === 'csv' ? 'text-green-700' : 'text-gray-700'}`}>Excel/CSV</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Status Filter
                </label>
                <select
                  name="statusFilter"
                  value={reportFilters.statusFilter}
                  onChange={handleReportFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active Users Only</option>
                  <option value="disabled">Disabled Users Only</option>
                </select>
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Role Filter
                </label>
                <select
                  name="roleFilter"
                  value={reportFilters.roleFilter}
                  onChange={handleReportFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Regular Users Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Date Range
                </label>
                <select
                  name="dateRange"
                  value={reportFilters.dateRange}
                  onChange={handleReportFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="lastMonth">Last 30 Days</option>
                  <option value="lastWeek">Last 7 Days</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeReportModal}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaFileDownload /> Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 