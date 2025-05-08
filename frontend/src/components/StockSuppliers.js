import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import authService from '../services/authService';

const StockSuppliers = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    supplierName: '',
    contact: '',
    location: '',
    email: '',
    supplyItems: '',
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

    fetchSuppliers();
  }, [navigate]);

  useEffect(() => {
    // Filter suppliers based on the search term
    setFilteredSuppliers(
      suppliers.filter(
        (supplier) =>
          supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, suppliers]);

  const fetchSuppliers = async () => {
    try {
      // Set auth header for API calls
      authService.setAuthHeader();
      const response = await axios.get('http://localhost:5000/api/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Set auth header for API calls
      authService.setAuthHeader();
      await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
      fetchSuppliers();
      toast.success('Supplier deleted successfully');
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };

  const handleInputChange = (e) => {
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      // Process supply items to convert to array
      const supplyItemsArray = newSupplier.supplyItems
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
      
      // Set auth header for API calls
      authService.setAuthHeader();
      await axios.post('http://localhost:5000/api/suppliers', {
        ...newSupplier,
        supplyItems: supplyItemsArray
      });
      
      fetchSuppliers();
      setShowModal(false);
      setNewSupplier({
        supplierName: '',
        contact: '',
        location: '',
        email: '',
        supplyItems: '',
      });
      toast.success('Supplier added successfully');
    } catch (error) {
      toast.error('Failed to add supplier');
    }
  };

  const handleEditClick = (supplier) => {
    // Convert supply items array to comma separated string for editing
    setCurrentSupplier({
      ...supplier,
      supplyItems: supplier.supplyItems.join(', ')
    });
    setEditModal(true);
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    try {
      // Process supply items to convert to array
      const supplyItemsArray = currentSupplier.supplyItems
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
      
      // Set auth header for API calls
      authService.setAuthHeader();
      await axios.put(`http://localhost:5000/api/suppliers/${currentSupplier._id}`, {
        ...currentSupplier,
        supplyItems: supplyItemsArray
      });
      
      fetchSuppliers();
      setEditModal(false);
      toast.success('Supplier updated successfully');
    } catch (error) {
      toast.error('Failed to update supplier');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Supplier Management</h1>
          <Link 
            to="/admin/stock" 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
          >
            Back to Stock Dashboard
          </Link>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <button 
          onClick={() => setShowModal(true)} 
          className="px-4 py-2 bg-green-600 text-white rounded mb-4 hover:bg-green-700"
        >
          + Add Supplier
        </button>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supply Items</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{supplier.supplierName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{supplier.contact}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{supplier.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{supplier.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {supplier.supplyItems.map((item, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleEditClick(supplier)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(supplier._id)} 
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Supplier Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="modal-overlay">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Supplier</h3>
              <form onSubmit={handleAddSupplier}>
                <div className="mb-4">
                  <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700">Supplier Name</label>
                  <input 
                    type="text" 
                    name="supplierName" 
                    id="supplierName" 
                    value={newSupplier.supplierName} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input 
                    type="text" 
                    name="contact" 
                    id="contact" 
                    value={newSupplier.contact} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    id="location" 
                    value={newSupplier.location} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    id="email" 
                    value={newSupplier.email} 
                    onChange={handleInputChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="supplyItems" className="block text-sm font-medium text-gray-700">Supply Items (comma separated)</label>
                  <input 
                    type="text" 
                    name="supplyItems" 
                    id="supplyItems" 
                    value={newSupplier.supplyItems} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Raw coir, Twine, Rope"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Supplier Modal */}
        {editModal && currentSupplier && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="modal-overlay">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Supplier</h3>
              <form onSubmit={handleUpdateSupplier}>
                <div className="mb-4">
                  <label htmlFor="edit-supplierName" className="block text-sm font-medium text-gray-700">Supplier Name</label>
                  <input 
                    type="text" 
                    id="edit-supplierName" 
                    value={currentSupplier.supplierName} 
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, supplierName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="edit-contact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input 
                    type="text" 
                    id="edit-contact" 
                    value={currentSupplier.contact} 
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, contact: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input 
                    type="text" 
                    id="edit-location" 
                    value={currentSupplier.location} 
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, location: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    id="edit-email" 
                    value={currentSupplier.email} 
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="edit-supplyItems" className="block text-sm font-medium text-gray-700">Supply Items (comma separated)</label>
                  <input 
                    type="text" 
                    id="edit-supplyItems" 
                    value={currentSupplier.supplyItems} 
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, supplyItems: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required 
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setEditModal(false)} 
                    className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSuppliers; 