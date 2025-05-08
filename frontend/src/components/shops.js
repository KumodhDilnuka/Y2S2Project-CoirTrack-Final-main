import React, { useState, useEffect } from 'react';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import 'bootstrap/dist/css/bootstrap.min.css';
import SupplierContactModal from './mailsender';
import Header from './Navbar/Header';
import Footer from './Navbar/Footer';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/item/');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);
    
    // Updated search and filter functionality
    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
    };

    // Filter products based on search term
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.catogory.toLowerCase().includes(searchTerm)
    );

    const addToCart = (product) => {
        if (product.count <= 0) {
            alert('Sorry, this item is out of stock!');
            return;
        }

        const existingItem = cart.find(item => item._id === product._id);
        
        if (existingItem) {
            if (existingItem.quantity + 1 > product.count) {
                alert(`Sorry, only ${product.count} item(s) available!`);
                return;
            }

            setCart(cart.map(item => 
                item._id === product._id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === productId);
            
            if (existingItem.quantity > 1) {
                // Reduce quantity by 1
                return prevCart.map(item => 
                    item._id === productId 
                        ? { ...item, quantity: item.quantity - 1 } 
                        : item
                );
            } else {
                // Remove the item completely if quantity is 1
                return prevCart.filter(item => item._id !== productId);
            }
        });
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handlePaymentSuccess = (status) => {
        setPaymentStatus(status);
        setShowPaymentForm(false);
        setCart([]); // Clear cart after successful payment
    };

    // If payment history is shown
    if (showPaymentHistory) {
        return (
            <div className="w-full flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow">
                    <button 
                        onClick={() => setShowPaymentHistory(false)}
                        className="btn btn-secondary m-3"
                    >
                        Back to Shop
                    </button>
                    <PaymentHistory />
                </div>
                <Footer />
            </div>
        );
    }

    // If payment is successful, render payment success view
    if (paymentStatus) {
        return (
            <div className="w-full flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow bg-green-100 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-2xl w-full mx-4">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-24 w-24 mx-auto text-green-500 mb-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                        </svg>
                        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
                        <p className="mb-2">Payment ID: {paymentStatus.paymentId}</p>
                        <p className="text-xl font-semibold mb-4">
                            Total Amount: Rs.{paymentStatus.totalAmount.toFixed(2)}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button 
                                onClick={() => setPaymentStatus(null)}
                                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                            >
                                Continue Shopping
                            </button>
                            <button 
                                onClick={() => setShowPaymentHistory(true)}
                                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                            >
                                View Payment History
                            </button>
                            <button 
                                onClick={() => setIsContactModalOpen(true)}
                                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300"
                            >
                                Delivery Contact
                            </button>
                            <a href="/pay">
                                <button 
                                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300"
                                >
                                    Order Pending
                                </button>
                            </a>
                        </div>
                        {/* Contact Modal */}
                        <SupplierContactModal 
                            isOpen={isContactModalOpen} 
                            onClose={() => setIsContactModalOpen(false)} 
                        />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // If payment form is shown
    if (showPaymentForm) {
        return (
            <div className="w-full flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow">
                    <PaymentForm 
                        cart={cart}
                        totalAmount={calculateTotal()}
                        onPaymentSuccess={handlePaymentSuccess}
                    />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
                {/* Hero banner */}
                <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg mb-8 p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Coir Products Shop</h1>
                    <p className="text-lg opacity-90 mb-4">Discover our wide range of high-quality coir products</p>
                    
                    {/* Search bar inside banner */}
                    <div className="relative max-w-xl">
                        <input 
                            type="text" 
                            placeholder="Search products by name or category..." 
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full py-3 px-4 pr-10 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    {/* Results count */}
                    <div className="text-gray-700">
                        {filteredProducts.length === products.length 
                            ? `Showing all ${products.length} products` 
                            : `Showing ${filteredProducts.length} of ${products.length} products`
                        }
                        {searchTerm && <span className="ml-2 italic">Results for: "{searchTerm}"</span>}
                    </div>
                    
                    {/* View history button */}
                    <button 
                        onClick={() => setShowPaymentHistory(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-300"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Order History
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Product grid */}
                    <div className="w-full lg:w-3/4">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                        <div className="relative">
                                            <img 
                                                src={`http://localhost:5000/images/${product.filepath}`} 
                                                alt={product.name} 
                                                className="w-full h-48 object-cover"
                                            />
                                            {product.count <= 0 && (
                                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                                                    Out of Stock
                                                </div>
                                            )}
                                            {product.count > 0 && product.count <= 5 && (
                                                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                                                    Low Stock: {product.count} left
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                                <span className="text-lg font-bold text-green-600">Rs.{product.price}</span>
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm text-gray-500">Category: {product.catogory}</p>
                                            </div>
                                            <p className="mt-2 text-gray-600 text-sm line-clamp-2">{product.description}</p>
                                            <div className="mt-4">
                                                <button 
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.count <= 0}
                                                    className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                                                        product.count <= 0 
                                                            ? 'bg-gray-300 cursor-not-allowed' 
                                                            : 'bg-green-600 hover:bg-green-700 text-white transition-colors'
                                                    }`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                                    </svg>
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-700 mt-4">No products found</h3>
                                <p className="text-gray-500 mt-2">Try a different search term or browse all products.</p>
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    View All Products
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Cart sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
                                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-sm">
                                    {cart.reduce((total, item) => total + item.quantity, 0)} items
                                </span>
                            </div>
                            
                            {cart.length === 0 ? (
                                <div className="py-6 text-center">
                                    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                    </svg>
                                    <p className="mt-4 text-gray-500">Your cart is empty</p>
                                    <p className="text-sm text-gray-400 mt-1">Add some products to get started</p>
                                </div>
                            ) : (
                                <>
                                    <div className="max-h-96 overflow-y-auto divide-y">
                                        {cart.map(item => (
                                            <div key={item._id} className="py-3 flex items-start gap-3">
                                                <img 
                                                    src={`http://localhost:5000/images/${item.filepath}`} 
                                                    alt={item.name} 
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                                                    <p className="text-gray-500 text-sm">Rs.{item.price} × {item.quantity}</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="font-medium">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                                                    <div className="flex items-center mt-1 border rounded-lg overflow-hidden">
                                                        <button 
                                                            onClick={() => removeFromCart(item._id)}
                                                            className="px-2 py-1 text-red-600 hover:bg-red-50"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="px-2 py-1 text-sm border-l border-r">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => addToCart(item)}
                                                            className="px-2 py-1 text-green-600 hover:bg-green-50"
                                                            disabled={item.quantity >= item.count}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex justify-between text-lg">
                                            <span className="font-medium">Total:</span>
                                            <span className="font-bold text-green-600">Rs.{calculateTotal().toFixed(2)}</span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => setShowPaymentForm(true)}
                                            className="mt-4 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                            </svg>
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Shop;