// frontend/src/components/SupplierForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
const SupplierForm = ({ supplierToEdit, onSupplierAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    products: []
  });

  useEffect(() => {
    if (supplierToEdit) {
      setFormData(supplierToEdit);
    }
  }, [supplierToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleProductChange = (e) => {
    const products = e.target.value.split(',').map(product => product.trim());
    setFormData(prevState => ({
      ...prevState,
      products
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (supplierToEdit) {
        // Update existing supplier
        const response = await axios.put(
          `http://localhost:5000/api/suppliers/${supplierToEdit._id}`, 
          formData
        );
        onSupplierAdded(response.data);
      } else {
        // Create new supplier
        const response = await axios.post(
          'http://localhost:5000/api/suppliers', 
          formData
        );
        onSupplierAdded(response.data);
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        contact: '',
        address: '',
        products: []
      });
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  return (
    <div className="supplier-form">
      <h2>{supplierToEdit ? 'Edit Supplier' : 'Add New Supplier'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Supplier Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={formData.contact}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="products"
          placeholder="Products (comma-separated)"
          value={formData.products.join(', ')}
          onChange={handleProductChange}
        />
        <button type="submit">
          {supplierToEdit ? 'Update Supplier' : 'Add Supplier'}
        </button>
      </form>
    </div>
  );
};

export default SupplierForm;