import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import authService from '../services/authService';

const PaymentForm = ({ cart, totalAmount, onPaymentSuccess }) => {
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    
    const [errors, setErrors] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Format input based on field type
        let formattedValue = value;
        
        if (name === 'cardNumber') {
            // Allow only digits
            formattedValue = value.replace(/\D/g, '').slice(0, 16);
        } else if (name === 'expiryDate') {
            // Format as MM/YY
            const digits = value.replace(/\D/g, '').slice(0, 4);
            if (digits.length > 2) {
                formattedValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
            } else {
                formattedValue = digits;
            }
        } else if (name === 'cvv') {
            // Allow only digits for CVV
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }
        
        setCardDetails(prevDetails => ({
            ...prevDetails,
            [name]: formattedValue
        }));
        
        // Clear error when user types
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'cardNumber':
                // Luhn algorithm check (credit card validation)
                if (value.length !== 16) {
                    return 'Card number must be 16 digits';
                }
                
                // Basic Luhn algorithm implementation
                let sum = 0;
                let shouldDouble = false;
                for (let i = value.length - 1; i >= 0; i--) {
                    let digit = parseInt(value.charAt(i));
                    
                    if (shouldDouble) {
                        digit *= 2;
                        if (digit > 9) digit -= 9;
                    }
                    
                    sum += digit;
                    shouldDouble = !shouldDouble;
                }
                
                if (sum % 10 !== 0) {
                    return 'Invalid card number';
                }
                return '';
                
            case 'cardName':
                if (value.trim() === '') {
                    return 'Cardholder name is required';
                }
                if (!/^[a-zA-Z\s]+$/.test(value)) {
                    return 'Name should contain only letters';
                }
                return '';
                
            case 'expiryDate':
                if (!/^\d{2}\/\d{2}$/.test(value)) {
                    return 'Format should be MM/YY';
                }
                
                const [month, year] = value.split('/').map(part => parseInt(part, 10));
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear() % 100;
                const currentMonth = currentDate.getMonth() + 1;
                
                if (month < 1 || month > 12) {
                    return 'Invalid month';
                }
                
                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    return 'Card has expired';
                }
                return '';
                
            case 'cvv':
                if (!/^\d{3}$/.test(value)) {
                    return 'CVV must be 3 digits';
                }
                return '';
                
            default:
                return '';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        
        // Validate each field
        Object.keys(cardDetails).forEach(field => {
            const error = validateField(field, cardDetails[field]);
            newErrors[field] = error;
            if (error) isValid = false;
        });
        
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Get the current user
            const currentUser = authService.getCurrentUser();
            console.log("Payment form - Current user:", currentUser); // Debug log
            
            if (!currentUser) {
                alert('Please log in to complete your purchase.');
                return;
            }
            
            // Ensure userId is stored as a string to match the database schema
            const userId = String(currentUser.user.id);
            console.log("Payment form - User ID (as string):", userId); // Debug log
            
            const paymentPayload = {
                userId,
                items: cart.map(item => ({
                    itemId: item._id,
                    quantity: item.quantity
                })),
                cardDetails: {
                    lastFourDigits: cardDetails.cardNumber.slice(-4)
                }
            };
            
            console.log("Payment payload:", paymentPayload); // Debug log

            const response = await fetch('http://localhost:5000/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentPayload)
            });

            const responseData = await response.json();
            
            if (response.ok) {
                onPaymentSuccess({
                    paymentId: responseData.paymentId,
                    totalAmount: responseData.totalAmount
                });
            } else {
                throw new Error(responseData.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            alert('Payment failed. Please try again.');
        }
    };

    // Function to identify card type based on card number
    const getCardType = (number) => {
        if (number.startsWith('4')) return 'Visa';
        if (number.startsWith('5')) return 'Mastercard';
        if (number.startsWith('3')) return 'American Express';
        if (number.startsWith('6')) return 'Discover';
        
        return '';
    };

    const cardType = getCardType(cardDetails.cardNumber);

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Payment Details</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2">Card Number</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className={`bg-gray-50 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                            required
                        />
                        {cardType && (
                            <span className="absolute right-3 top-2.5 text-sm font-medium text-gray-500">
                                {cardType}
                            </span>
                        )}
                    </div>
                    {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                </div>
                
                <div className="mb-4">
                    <label className="block mb-2">Cardholder Name</label>
                    <input
                        type="text"
                        name="cardName"
                        value={cardDetails.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`bg-gray-50 border ${errors.cardName ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        required
                    />
                    {errors.cardName && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                    )}
                </div>
                
                <div className="flex space-x-4 mb-4">
                    <div className="flex-1">
                        <label className="block mb-2">Expiry Date</label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className={`bg-gray-50 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                            required
                        />
                        {errors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block mb-2">CVV</label>
                        <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className={`bg-gray-50 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                            required
                        />
                        {errors.cvv && (
                            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                    </div>
                </div>
                
                <div className="mb-6">
                    <p className="font-bold text-xl text-center">
                        Total Amount: Rs.{totalAmount.toFixed(2)}
                    </p>
                </div>
                
                <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition duration-300"
                >
                    Complete Payment
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;