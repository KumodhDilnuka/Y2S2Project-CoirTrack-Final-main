import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const PaymentSuccess = () => {
    const location = useLocation();
    const { paymentId, totalAmount } = location.state || {};

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="card shadow-lg p-4 text-center" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="card-body">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-20 w-20 mx-auto text-success mb-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        style={{ height: '100px', width: '100px' }}
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                    </svg>
                    
                    <h1 className="card-title mb-4">Payment Successful!</h1>
                    
                    {paymentId && (
                        <div className="mb-4">
                            <p className="mb-2">
                                <strong>Payment ID:</strong> {paymentId}
                            </p>
                            <p className="h4 text-success">
                                Total Amount: Rs.{totalAmount?.toFixed(2) || 'N/A'}
                            </p>
                        </div>
                    )}
                    
                    <div className="d-flex justify-content-center gap-3">
                        <Link 
                            to="/shop" 
                            className="btn btn-primary"
                        >
                            Continue Shopping
                        </Link>
                        <Link 
                            to="/payment-history" 
                            className="btn btn-success"
                        >
                            View Payment History
                        </Link>
                        <Link 
                            to="/pay" 
                            className="btn btn-success"
                        >
                            Order Pending
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;