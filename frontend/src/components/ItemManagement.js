import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
const ItemManagement = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    _id: '',
    itemCode: '',
    itemName: '',
    brand: '',
    category: '',
    description: '',
    productImage: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const categories = [
    'Fruits', 'Vegetables', 'Dairy', 'Bakery', 
    'Meat', 'Frozen', 'Pantry', 'Beverages', 'Snacks'
  ];

  // Fetch Items
  const fetchItems = async () => {
    try {
      const response = await axios.get('/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
     
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'productImage') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        productImage: file
      }));

      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        formDataToSend.append(key, formData[key]);
      }
    });
  
    // Log form data for debugging
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
  
    try {
      const response = await axios.post('/api/items', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Item saved successfully:', response.data);
      
      fetchItems();
      resetForm();
    } catch (error) {
      console.error('Full Error:', error);
      alert(
        error.response?.data?.message || 
        error.message || 
        'Failed to save item'
      );
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      _id: '',
      itemCode: '',
      itemName: '',
      brand: '',
      category: '',
      description: '',
      productImage: null
    });
    setIsEditing(false);
    setPreviewImage(null);
  };

  // Handle Edit
  const handleEdit = (item) => {
    setFormData({
      ...item,
      productImage: null // Reset image file for update
    });
    setIsEditing(true);
    setPreviewImage(item.productImage);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/items/${id}`);
        fetchItems();
        resetForm();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Item Code</label>
              <input
                type="text"
                name="itemCode"
                value={formData.itemCode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item code"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Item Name</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item name"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter brand"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="col-span-full">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter item description"
              rows="3"
            />
          </div>

          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Product Image</label>
              <input
                type="file"
                name="productImage"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {previewImage && (
              <div>
                <label className="block text-gray-700 mb-2">Image Preview</label>
                <img 
                  src={previewImage} 
                  alt="Product Preview" 
                  className="w-48 h-48 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="col-span-full flex justify-center space-x-4 mt-6">
            <button
              type="submit"
              className={`px-6 py-2 rounded-md text-white ${
                isEditing 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } transition duration-300`}
            >
              {isEditing ? 'Update Item' : 'Add Item'}
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Item List */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">Item List</h3>
        
        {items.length === 0 ? (
          <p className="text-center text-gray-600">No items found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div 
                key={item._id} 
                className="bg-white shadow-md rounded-lg overflow-hidden transform transition hover:scale-105"
              >
                {item.productImage && (
                  <img 
                    src={item.productImage} 
                    alt={item.itemName} 
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{item.itemName}</h3>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Code:</strong> {item.itemCode}</p>
                    <p><strong>Brand:</strong> {item.brand}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    {item.description && (
                      <p className="mt-2 italic">{item.description}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemManagement;