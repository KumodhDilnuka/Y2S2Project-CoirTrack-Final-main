import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const AdminOrdersPanel = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is admin
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
            toast.error('Please log in to access this page');
            navigate('/login');
            return;
        }
        
        console.log("Current user:", currentUser);
        if (!currentUser.user || currentUser.user.role !== 'admin') {
            toast.error('Admin access required');
            navigate('/dashboard');
            return;
        }

        fetchPendingOrders();
    }, [navigate]);

    const fetchPendingOrders = async () => {
        try {
            setLoading(true);
            
            // Get current user and token
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                toast.error('Please log in to access this page');
                navigate('/login');
                return;
            }
            
            console.log("Current user object structure:", JSON.stringify(currentUser, null, 2));
            
            // Extract token from the user object - trying different possible structures
            let token = null;
            
            if (typeof currentUser.token === 'string') {
                token = currentUser.token;
                console.log("Found token directly in user object");
            } else if (currentUser.user && typeof currentUser.user.token === 'string') {
                token = currentUser.user.token;
                console.log("Found token in user.user object");
            } else {
                // If token is not found in expected places, try to find it elsewhere
                console.log("Token not found in expected locations, searching entire object");
                const userStr = JSON.stringify(currentUser);
                const tokenMatch = userStr.match(/"token":"([^"]+)"/);
                if (tokenMatch && tokenMatch[1]) {
                    token = tokenMatch[1];
                    console.log("Found token in object using string search");
                }
            }
            
            if (!token) {
                // Use serviceToken as a fallback
                token = authService.getToken();
                console.log("Using authService.getToken() as fallback");
            }
            
            if (!token) {
                toast.error('Authentication token not found');
                console.error('Auth token missing from user object:', currentUser);
                navigate('/login');
                return;
            }
            
            console.log('Fetching pending orders...');
            console.log('Using token:', token);
            
            const headers = {
                'Content-Type': 'application/json',
                'x-auth-token': token
            };
            
            console.log('Request headers:', headers);
            
            const response = await axios.get('http://localhost:5000/payment/pending', {
                headers: headers
            });
            
            console.log('Response status:', response.status);
            console.log('Received pending orders:', response.data);
            
            setPendingOrders(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching pending orders:', err);
            const responseData = err.response?.data;
            console.error('Error response data:', responseData);
            
            let errorMessage = 'Failed to fetch pending orders';
            if (responseData?.message) {
                errorMessage = responseData.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
            
            if (err.response?.status === 403 || err.response?.status === 401) {
                navigate('/dashboard');
            }
            
            setLoading(false);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const handleApprove = async (orderId) => {
        try {
            // Get current user and token
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                toast.error('Please log in to access this feature');
                navigate('/login');
                return;
            }
            
            // Set auth token for the request
            const token = currentUser.token;
            if (!token) {
                toast.error('Authentication token not found');
                console.error('Auth token missing from user object:', currentUser);
                navigate('/login');
                return;
            }
            
            console.log(`Approving order ${orderId}...`);
            console.log('Using token:', token);
            
            const response = await axios.put(`http://localhost:5000/payment/approve/${orderId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });
            
            console.log('Approval response:', response.data);
            toast.success('Order approved successfully');
            fetchPendingOrders(); // Refresh the list
            setShowModal(false);
        } catch (err) {
            console.error('Error approving order:', err);
            console.error('Error response:', err.response);
            const errorMessage = err.response?.data?.message || 'Failed to approve order';
            toast.error(errorMessage);
            
            if (err.response?.status === 403) {
                navigate('/dashboard');
            }
        }
    };

    const handleReject = async (orderId) => {
        try {
            // Get current user and token
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                toast.error('Please log in to access this feature');
                navigate('/login');
                return;
            }
            
            // Set auth token for the request
            const token = currentUser.token;
            if (!token) {
                toast.error('Authentication token not found');
                console.error('Auth token missing from user object:', currentUser);
                navigate('/login');
                return;
            }
            
            console.log(`Rejecting order ${orderId}...`);
            console.log('Using token:', token);
            
            const response = await axios.put(`http://localhost:5000/payment/reject/${orderId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });
            
            console.log('Rejection response:', response.data);
            toast.success('Order rejected successfully');
            fetchPendingOrders(); // Refresh the list
            setShowModal(false);
        } catch (err) {
            console.error('Error rejecting order:', err);
            console.error('Error response:', err.response);
            const errorMessage = err.response?.data?.message || 'Failed to reject order';
            toast.error(errorMessage);
            
            if (err.response?.status === 403) {
                navigate('/dashboard');
            }
        }
    };

    // New function to ensure pending orders exist
    const createTestPendingOrders = async () => {
        try {
            // Get current user and token
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                toast.error('Please log in to access this feature');
                navigate('/login');
                return;
            }
            
            let token = null;
            
            if (typeof currentUser.token === 'string') {
                token = currentUser.token;
            } else if (currentUser.user && typeof currentUser.user.token === 'string') {
                token = currentUser.user.token;
            } else {
                const userStr = JSON.stringify(currentUser);
                const tokenMatch = userStr.match(/"token":"([^"]+)"/);
                if (tokenMatch && tokenMatch[1]) {
                    token = tokenMatch[1];
                }
            }
            
            if (!token) {
                token = authService.getToken();
            }
            
            if (!token) {
                toast.error('Authentication token not found');
                navigate('/login');
                return;
            }
            
            setLoading(true);
            const response = await axios.post('http://localhost:5000/payment/ensure-pending-orders', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });
            
            console.log('Create test orders response:', response.data);
            toast.success(response.data.message);
            fetchPendingOrders(); // Refresh the list
        } catch (err) {
            console.error('Error creating test orders:', err);
            const errorMessage = err.response?.data?.message || 'Failed to create test orders';
            toast.error(errorMessage);
            
            if (err.response?.status === 403) {
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderApprovalStatusBadge = (status) => {
        const statusColors = {
            'Pending': 'bg-warning',
            'Approved': 'bg-success',
            'Rejected': 'bg-danger'
        };
        return (
            <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
                {status}
            </span>
        );
    };

    const OrderDetailsModal = () => {
        if (!selectedOrder) return null;

        return (
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Order Details</h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">Order Information</h5>
                                    <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                                    <p><strong>Customer ID:</strong> {selectedOrder.userId}</p>
                                    <p><strong>Date:</strong> {new Date(selectedOrder.paymentDate).toLocaleString()}</p>
                                    <p><strong>Total Amount:</strong> Rs.{selectedOrder.totalAmount.toFixed(2)}</p>
                                    <p>
                                        <strong>Payment Status:</strong> 
                                        <span className={`badge ${selectedOrder.paymentStatus === 'Completed' ? 'bg-success' : 'bg-warning'} ms-2`}>
                                            {selectedOrder.paymentStatus}
                                        </span>
                                    </p>
                                    <p>
                                        <strong>Approval Status:</strong> 
                                        {renderApprovalStatusBadge(selectedOrder.approvalStatus)}
                                    </p>
                                </div>
                            </div>

                            <h6 className="mb-3">Order Items</h6>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.itemId.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>Rs.{item.price.toFixed(2)}</td>
                                            <td>Rs.{(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <div className="d-flex gap-2 w-100">
                                <button 
                                    type="button" 
                                    className="btn btn-success flex-grow-1" 
                                    onClick={() => handleApprove(selectedOrder._id)}
                                    disabled={selectedOrder.approvalStatus !== 'Pending'}
                                >
                                    Approve Order
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger flex-grow-1" 
                                    onClick={() => handleReject(selectedOrder._id)}
                                    disabled={selectedOrder.approvalStatus !== 'Pending'}
                                >
                                    Reject Order
                                </button>
                            </div>
                            <button 
                                type="button" 
                                className="btn btn-secondary w-100 mt-2" 
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div>
            <Header />
            <div className="container mt-5 mb-5">
                <div className="text-center py-4">Loading orders...</div>
            </div>
            <Footer />
        </div>
    );
    
    if (error) return (
        <div>
            <Header />
            <div className="container mt-5 mb-5">
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
            </div>
            <Footer />
        </div>
    );

    return (
        <div>
            <Header />
            <div className="container mt-5 mb-5">
                <h2 className="mb-4 text-center">Pending Orders For Approval</h2>
                
                {pendingOrders.length === 0 ? (
                    <div className="alert alert-info text-center">
                        No pending orders found.
                        {/* Temporarily disabled create test orders button
                        <div className="mt-3">
                            <button 
                                onClick={createTestPendingOrders} 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Create Test Orders'}
                            </button>
                        </div>
                        */}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="thead-light">
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order._id.substring(0, 8)}...</td>
                                        <td>{order.userId.substring(0, 8)}...</td>
                                        <td>{new Date(order.paymentDate).toLocaleDateString()}</td>
                                        <td>Rs.{order.totalAmount.toFixed(2)}</td>
                                        <td>{renderApprovalStatusBadge(order.approvalStatus)}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {/* Temporarily disabled View Details button
                                                <button 
                                                    onClick={() => handleViewDetails(order)} 
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    View Details
                                                </button>
                                                */}
                                                <button 
                                                    onClick={() => handleApprove(order._id)} 
                                                    className="btn btn-success btn-sm"
                                                    disabled={order.approvalStatus !== 'Pending'}
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(order._id)} 
                                                    className="btn btn-danger btn-sm"
                                                    disabled={order.approvalStatus !== 'Pending'}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <OrderDetailsModal />
            </div>
            <Footer />
        </div>
    );
};

export default AdminOrdersPanel; 