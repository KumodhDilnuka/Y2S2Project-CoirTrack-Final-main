import React, { useState } from 'react';

const CustomerInfoModal = ({ onSubmit, onCancel }) => {
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!email || !location) {
            setErrorMessage('Please fill in all fields');
            return;
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('Please enter a valid email address');
            return;
        }

        onSubmit({ email, location });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-4">Customer Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2">Email Address</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="location" className="block mb-2">Delivery Location</label>
                        <input 
                            type="text" 
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Enter delivery address"
                            required
                        />
                    </div>
                    {errorMessage && (
                        <div className="text-red-500 mb-4">{errorMessage}</div>
                    )}
                    <div className="flex justify-between">
                        <button 
                            type="submit" 
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Continue to Payment
                        </button>
                        <button 
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerInfoModal;