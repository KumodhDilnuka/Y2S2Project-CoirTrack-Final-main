import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const OrderStatus = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Check if user is logged in
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    toast.error('Please log in to view order details');
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

                console.log('Fetching order with ID:', orderId);
                console.log('Using token:', token);
                
                const response = await axios.get(`http://localhost:5000/payment/${orderId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                });
                
                console.log('Received order data:', response.data);
                setOrder(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order:', err);
                console.error('Error response:', err.response);
                const errorMessage = err.response?.data?.message || 'Failed to fetch order details';
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        } else {
            setError('No order ID provided');
            setLoading(false);
        }
    }, [orderId, navigate]);

    if (loading) return (
        <div>
            <Header />
            <div className="container py-5">
                <div className="text-center py-4">Loading order details...</div>
            </div>
            <Footer />
        </div>
    );

    if (error) return (
        <div>
            <Header />
            <div className="container py-5">
                <div className="alert alert-danger text-center" role="alert">
                    {error}
                </div>
            </div>
            <Footer />
        </div>
    );

    if (!order) return (
        <div>
            <Header />
            <div className="container py-5">
                <div className="alert alert-warning text-center" role="alert">
                    Order not found
                </div>
            </div>
            <Footer />
        </div>
    );

    const getStatusStep = () => {
        if (order.approvalStatus === 'Rejected') {
            return 0; // Rejected
        } else if (order.approvalStatus === 'Pending') {
            return 1; // Pending Approval
        } else if (order.approvalStatus === 'Approved') {
            return 2; // Processing
        }
        // Add more steps as needed for shipping, delivery, etc.
    };

    const statusStep = getStatusStep();

    return (
        <div>
            <Header />
            <div className="container py-5">
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-lg">
                            <div className="card-header bg-primary text-white">
                                <h3 className="mb-0">Order Status</h3>
                            </div>
                            <div className="card-body">
                                <div className="order-info mb-4">
                                    <h5>Order Information</h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p><strong>Order ID:</strong> {order._id}</p>
                                            <p><strong>Order Date:</strong> {new Date(order.paymentDate).toLocaleString()}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p><strong>Total Amount:</strong> Rs.{order.totalAmount.toFixed(2)}</p>
                                            <p>
                                                <strong>Payment Status:</strong> 
                                                <span className={`badge ${order.paymentStatus === 'Completed' ? 'bg-success' : 'bg-warning'} ms-2`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-status mb-4">
                                    <h5>Current Status</h5>
                                    <div className="progress mb-3" style={{ height: '30px' }}>
                                        <div 
                                            className={`progress-bar ${order.approvalStatus === 'Rejected' ? 'bg-danger' : 'bg-success'}`} 
                                            role="progressbar" 
                                            style={{ width: `${statusStep * 33.33}%` }} 
                                            aria-valuenow={statusStep * 33.33} 
                                            aria-valuemin="0" 
                                            aria-valuemax="100"
                                        >
                                            {order.approvalStatus === 'Rejected' ? 'Rejected' : 
                                             order.approvalStatus === 'Pending' ? 'Pending Approval' : 
                                             'Approved - Processing'}
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between text-center">
                                        <div className={`status-step ${statusStep >= 0 ? 'fw-bold' : ''}`}>
                                            <div className={`status-indicator ${order.approvalStatus === 'Rejected' ? 'bg-danger' : (statusStep >= 1 ? 'bg-success' : 'bg-secondary')}`}>1</div>
                                            <div>Order Placed</div>
                                        </div>
                                        <div className={`status-step ${statusStep >= 1 ? 'fw-bold' : ''}`}>
                                            <div className={`status-indicator ${statusStep >= 1 ? 'bg-success' : 'bg-secondary'}`}>2</div>
                                            <div>Pending Approval</div>
                                        </div>
                                        <div className={`status-step ${statusStep >= 2 ? 'fw-bold' : ''}`}>
                                            <div className={`status-indicator ${statusStep >= 2 ? 'bg-success' : 'bg-secondary'}`}>3</div>
                                            <div>Processing</div>
                                        </div>
                                    </div>
                                    
                                    {order.approvalStatus === 'Rejected' && (
                                        <div className="alert alert-danger mt-3">
                                            Your order has been rejected. Please contact customer service for more information.
                                        </div>
                                    )}
                                </div>

                                <div className="order-items mb-4">
                                    <h5>Order Items</h5>
                                    <div className="table-responsive">
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
                                                {order.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.itemId.name}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>Rs.{item.price.toFixed(2)}</td>
                                                        <td>Rs.{(item.quantity * item.price).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                                    <td><strong>Rs.{order.totalAmount.toFixed(2)}</strong></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <Link to="/paymnetHistory" className="btn btn-secondary">
                                        Back to Orders
                                    </Link>
                                    <Link to="/shops" className="btn btn-primary">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default OrderStatus; 