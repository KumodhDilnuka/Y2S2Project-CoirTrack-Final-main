import React, { useState } from 'react';
import { Clock, Package, ShoppingCart, CheckCircle } from 'lucide-react';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';

const OrderPendingPage = () => {
    // State to track if order is approved
    const [isApproved, setIsApproved] = useState(false);
    
    // Function to handle order approval
    const handleApprove = () => {
        // Set the order as approved
        setIsApproved(true);
    };
    
    // If order is approved, show the approved content
    if (isApproved) {
        return (
            <div>
                <Header/>
                
                <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                    <div className="bg-white shadow-xl rounded-lg max-w-md w-full p-8 text-center">
                        <div className="mb-6">
                            <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
                        </div>
                        
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Your Order is Approved!
                        </h1>
                        
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                            <p className="text-green-700">
                                Good news! Your order has been approved and is now being processed for shipping.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button 
                                onClick={() => window.location.href = '/shops'}
                                className="flex items-center justify-center bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                            >
                                <ShoppingCart className="mr-2" size={20} />
                                Continue Shopping
                            </button>
                            
                            <button 
                                onClick={() => window.location.href = '/track-order'}
                                className="flex items-center justify-center bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-300"
                            >
                                <Package className="mr-2" size={20} />
                                Track Order
                            </button>
                        </div>
                    </div>
                </div>
                
                <Footer/>
            </div>
        );
    }
    
    // If order is still pending, show the pending content with admin button
    return (
        <div>
            <Header/>
            
            {/* Temporarily disabled Admin approval button 
            <div className="bg-gray-800 p-4 flex justify-center">
                <button 
                    onClick={handleApprove}
                    className="flex items-center bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-300"
                >
                    <CheckCircle className="mr-2" size={20} />
                    Admin: Approve This Order
                </button>
            </div>
            */}
       
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="bg-white shadow-xl rounded-lg max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <Clock className="mx-auto h-24 w-24 text-yellow-500 animate-pulse" />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Your Order is Pending
                    </h1>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                        <p className="text-yellow-700">
                            Your order is being processed. We'll update you on its status shortly.
                        </p>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                        <button 
                            onClick={() => window.location.href = '/shops'}
                            className="flex items-center bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                        >
                            <ShoppingCart className="mr-2" size={20} />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
            
            <Footer/>
        </div>
    );
};

export default OrderPendingPage;