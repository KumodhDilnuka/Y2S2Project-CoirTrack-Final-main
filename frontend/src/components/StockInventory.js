import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import authService from '../services/authService';
import '../components/css/styles.css'; // Make sure to copy necessary styles

const StockInventory = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [newStock, setNewStock] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
  });

  useEffect(() => {
    // Check if user is admin
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.user.role !== 'admin') {
      navigate('/dashboard');
      toast.error('Admin access required');
      return;
    }

    fetchStocks();
  }, [navigate]);

  useEffect(() => {
    // Filter stocks based on the search term
    setFilteredStocks(
      stocks.filter(
        (stock) =>
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, stocks]);

  const fetchStocks = async () => {
    try {
      // Set auth header for API calls
      authService.setAuthHeader();
      const response = await axios.get('http://localhost:5000/api/stocks');
      setStocks(response.data);
    } catch (error) {
      toast.error('Failed to fetch stocks');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Set auth header for API calls
      authService.setAuthHeader();
      await axios.delete(`http://localhost:5000/api/stocks/${id}`);
      fetchStocks();
      toast.success('Stock deleted successfully');
    } catch (error) {
      toast.error('Failed to delete stock');
    }
  };

  const handleInputChange = (e) => {
    setNewStock({ ...newStock, [e.target.name]: e.target.value });
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      // Set auth header for API calls
      authService.setAuthHeader();
      await axios.post('http://localhost:5000/api/stocks', newStock);
      fetchStocks();
      setShowModal(false);
      setNewStock({ name: '', quantity: '', price: '', category: '' });
      toast.success('Stock added successfully');
    } catch (error) {
      toast.error('Failed to add stock');
    }
  };

  const handleEditClick = (stock) => {
    setCurrentStock(stock);
    setEditModal(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      // Set auth header for API calls
      authService.setAuthHeader();
      await axios.put(`http://localhost:5000/api/stocks/${currentStock._id}`, currentStock);
      fetchStocks();
      setEditModal(false);
      toast.success('Stock updated successfully');
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <Link 
            to="/admin/stock" 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
          >
            Back to Stock Dashboard
          </Link>
        </div>

        <div className="table-container">
          <div className="search-container mb-4">
            <input
              type="text"
              placeholder="Search Stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button onClick={() => setShowModal(true)} className="add-btn px-4 py-2 bg-green-600 text-white rounded mb-4 hover:bg-green-700">
            + Add Stock
          </button>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.map((stock) => (
                <tr key={stock._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{stock.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stock.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Rs.{stock.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{stock.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleEditClick(stock)} className="edit-btn text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                    <button onClick={() => handleDelete(stock._id)} className="delete-btn text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Stock Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="modal-overlay">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Stock</h3>
                <form onSubmit={handleAddStock}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      id="name" 
                      value={newStock.name} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input 
                      type="number" 
                      name="quantity" 
                      id="quantity" 
                      value={newStock.quantity} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input 
                      type="number" 
                      name="price" 
                      id="price" 
                      value={newStock.price} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input 
                      type="text" 
                      name="category" 
                      id="category" 
                      value={newStock.category} 
                      onChange={handleInputChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required 
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Stock Modal */}
          {editModal && currentStock && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="modal-overlay">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Stock</h3>
                <form onSubmit={handleUpdateStock}>
                  <div className="mb-4">
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input 
                      type="text" 
                      id="edit-name" 
                      value={currentStock.name} 
                      onChange={(e) => setCurrentStock({ ...currentStock, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input 
                      type="number" 
                      id="edit-quantity" 
                      value={currentStock.quantity} 
                      onChange={(e) => setCurrentStock({ ...currentStock, quantity: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input 
                      type="number" 
                      id="edit-price" 
                      value={currentStock.price} 
                      onChange={(e) => setCurrentStock({ ...currentStock, price: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">Category</label>
                    <input 
                      type="text" 
                      id="edit-category" 
                      value={currentStock.category} 
                      onChange={(e) => setCurrentStock({ ...currentStock, category: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required 
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => setEditModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Update</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockInventory; 