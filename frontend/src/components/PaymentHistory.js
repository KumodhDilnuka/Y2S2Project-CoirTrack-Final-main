import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import { Link, useNavigate } from "react-router-dom";
import authService from '../services/authService';
import { toast } from 'react-toastify';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                // Get current user
                const currentUser = authService.getCurrentUser();
                console.log("Current user:", currentUser); // Debug log
                
                if (!currentUser) {
                    toast.error('Please log in to view your payment history');
                    navigate('/login');
                    return;
                }
                
                // Get auth token and userId
                const token = currentUser.token;
                if (!token) {
                    toast.error('Authentication token not found');
                    console.error('Auth token missing from user object:', currentUser);
                    navigate('/login');
                    return;
                }
                
                const userId = currentUser.user.id;
                console.log("User ID for query:", userId); // Debug log
                
                console.log("Sending request to fetch payments with token:", token);
                // Fetch payments - we're now using server-side filtering with authentication
                const response = await axios.get('http://localhost:5000/payment', {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                });
                
                console.log("API Response status:", response.status); // Debug log
                console.log("API Response data:", response.data); // Debug log
                
                // Double-check that we only have this user's payments (extra safety)
                const userPayments = currentUser.user.role === 'admin' 
                    ? response.data 
                    : response.data.filter(payment => payment.userId === userId);
                
                console.log("Filtered payments count:", userPayments.length);
                setPayments(userPayments);
                setLoading(false);
            } catch (err) {
                console.error('Payment Fetch Error:', err);
                console.error('Error response:', err.response);
                const errorMessage = err.response?.data?.message || 'Failed to fetch payment history';
                setError(errorMessage);
                toast.error(errorMessage);
                setLoading(false);
            }
        };

        fetchPayments();
    }, [navigate]);

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    const renderPaymentStatusBadge = (status) => {
        const statusColors = {
            'Completed': 'bg-success',
            'Pending': 'bg-warning',
            'Failed': 'bg-danger'
        };
        return (
            <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
                {status}
            </span>
        );
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

    const PaymentDetailsModal = () => {
        if (!selectedPayment) return null;

        return (
            <div><Header/>
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Payment Details</h5>
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
                                    <h5 className="card-title">Payment Information</h5>
                                    <p><strong>Payment ID:</strong> {selectedPayment._id}</p>
                                    <p><strong>Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleString()}</p>
                                    <p><strong>Total Amount:</strong> ${selectedPayment.totalAmount.toFixed(2)}</p>
                                    <p>
                                        <strong>Payment Status:</strong> 
                                        {renderPaymentStatusBadge(selectedPayment.paymentStatus)}
                                    </p>
                                    <p>
                                        <strong>Approval Status:</strong> 
                                        {renderApprovalStatusBadge(selectedPayment.approvalStatus || 'Pending')}
                                    </p>
                                </div>
                            </div>

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
                                    {selectedPayment.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.itemId.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.price.toFixed(2)}</td>
                                            <td>${(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
            </div>
        );
    };

    if (loading) return <div className="text-center py-4">Loading payments...</div>;
    
    if (error) return (
        <div className="alert alert-danger text-center" role="alert">
            {error}
        </div>
    );

    return (
        <div>
            <button>
            <Link 
                  to={"/"} 
                  className="btn btn-secondary m-3"
                >
                  Back
                </Link>
            </button>
        <div className="container mt-4">
            <h2 className="mb-4 text-center">Payment History</h2>
            
            {payments.length === 0 ? (
                <div className="alert alert-info text-center">
                    No payments found.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="thead-light">
                            <tr>
                                <th>Date</th>
                                <th>Total Amount</th>
                                <th>Payment Status</th>
                                <th>Approval Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment._id}>
                                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                    <td>Rs.{payment.totalAmount.toFixed(2)}</td>
                                    <td>{renderPaymentStatusBadge(payment.paymentStatus)}</td>
                                    <td>{renderApprovalStatusBadge(payment.approvalStatus || 'Pending')}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            {/* Temporarily disabled View Details button
                                            <button onClick={() => handleViewDetails(payment)} className="btn btn-primary btn-sm">
                                                View Details
                                            </button>
                                            */}
                                            <Link to={`/order-status/${payment._id}`} className="btn btn-info btn-sm">
                                                Track Order
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <PaymentDetailsModal />
        </div>
        
        </div>
    );
};

export default PaymentHistory;