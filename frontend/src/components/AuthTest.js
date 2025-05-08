import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const AuthTest = () => {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');
    const [authData, setAuthData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const testAuth = async () => {
            try {
                // Get current user data
                const currentUser = authService.getCurrentUser();
                setAuthData(currentUser || {});
                
                if (!currentUser) {
                    setError('Not logged in');
                    setLoading(false);
                    return;
                }
                
                // Get token directly from user object or from authService
                const directToken = currentUser.token || (currentUser.user && currentUser.user.token);
                const serviceToken = authService.getToken();
                
                setToken({
                    directToken,
                    serviceToken,
                    directTokenExists: !!directToken,
                    serviceTokenExists: !!serviceToken
                });
                
                if (!serviceToken) {
                    setError('No authentication token found');
                    setLoading(false);
                    return;
                }
                
                // Make test request
                const response = await axios.get('http://localhost:5000/payment/auth-test', {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': serviceToken
                    }
                });
                
                setResult(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Auth test error:', err);
                console.error('Error response:', err.response);
                setError(err.response?.data?.message || 'Authentication test failed');
                setLoading(false);
            }
        };
        
        testAuth();
    }, []);
    
    return (
        <div>
            <Header />
            <div className="container py-5">
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-lg">
                            <div className="card-header bg-primary text-white">
                                <h3 className="mb-0">Authentication Test</h3>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">Testing authentication...</p>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger">
                                        <h4 className="alert-heading">Authentication Error</h4>
                                        <p>{error}</p>
                                        
                                        <hr />
                                        
                                        <h5>Authentication Data</h5>
                                        <pre className="mb-0">{JSON.stringify(authData, null, 2)}</pre>
                                        
                                        <hr />
                                        
                                        <h5>Token Information</h5>
                                        <pre className="mb-0">{JSON.stringify(token, null, 2)}</pre>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="alert alert-success">
                                            <h4 className="alert-heading">Authentication Successful!</h4>
                                            <p>You are authenticated as: {result?.user?.name}</p>
                                            <p>Role: {result?.user?.role}</p>
                                        </div>
                                        
                                        <hr />
                                        
                                        <h5>Response Data</h5>
                                        <pre>{JSON.stringify(result, null, 2)}</pre>
                                        
                                        <hr />
                                        
                                        <h5>Token Information</h5>
                                        <pre>{JSON.stringify(token, null, 2)}</pre>
                                    </div>
                                )}
                                
                                <div className="mt-4 d-flex justify-content-between">
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => navigate(-1)}
                                    >
                                        Back
                                    </button>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => window.location.reload()}
                                    >
                                        Test Again
                                    </button>
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

export default AuthTest; 