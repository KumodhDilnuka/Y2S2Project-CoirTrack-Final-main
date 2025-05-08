// frontend/src/components/SupplierList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
const SupplierList = ({ onEditSupplier }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/suppliers');
      setSuppliers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch suppliers');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
      setSuppliers(suppliers.filter(supplier => supplier._id !== id));
    } catch (err) {
      setError('Failed to delete supplier');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="supplier-list">
      <h2>Suppliers</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier._id}>
              <td>{supplier.name}</td>
              <td>{supplier.email}</td>
              <td>{supplier.contact}</td>
              <td>
                <button onClick={() => onEditSupplier(supplier)}>Edit</button>
                <button onClick={() => handleDelete(supplier._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierList;