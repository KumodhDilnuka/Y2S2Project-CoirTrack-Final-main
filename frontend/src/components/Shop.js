import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import SupplierContactModal from './SupplierContactModal';
import Navbar from "./Navbar/Navbar";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null); // New state to track which product is being ordered
  const [lowStockItems, setLowStockItems] = useState([]); // New state to track low stock items
  
  // Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('none');
  const [countFilter, setCountFilter] = useState('all');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/item/');
        setProducts(response.data);
        setFilteredProducts(response.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(product => product.catogory))];
        setCategories(uniqueCategories);
        
        // Find low stock items
        const lowStock = response.data.filter(product => product.count > 0 && product.count <= 5);
        setLowStockItems(lowStock);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = [...products];
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.catogory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      results = results.filter(product => product.catogory === selectedCategory);
    }
    
    // Apply price range filter
    if (priceRange.min !== '') {
      results = results.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      results = results.filter(product => product.price <= parseFloat(priceRange.max));
    }
    
    // Apply count filter
    if (countFilter === 'inStock') {
      results = results.filter(product => product.count > 0);
    } else if (countFilter === 'outOfStock') {
      results = results.filter(product => product.count === 0);
    } else if (countFilter === 'lowStock') {
      results = results.filter(product => product.count > 0 && product.count <= 5);
    }
    
    // Apply sorting
    if (sortBy === 'priceLow') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'nameAZ') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'nameZA') {
      results.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'countLow') {
      results.sort((a, b) => a.count - b.count);
    } else if (sortBy === 'countHigh') {
      results.sort((a, b) => b.count - a.count);
    }
    
    setFilteredProducts(results);
  }, [searchTerm, products, selectedCategory, priceRange, sortBy, countFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('none');
    setCountFilter('all');
  };

  const handleDelete = async (productId) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this item?');
      
      if (confirmDelete) {
        await axios.delete(`http://localhost:5000/item/delete/${productId}`);
        const updatedProducts = products.filter(product => product._id !== productId);
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        
        // Update low stock items
        const lowStock = updatedProducts.filter(product => product.count > 0 && product.count <= 5);
        setLowStockItems(lowStock);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete the product');
    }
  };

  // Function to open contact modal with specific product
  const openContactModal = (product) => {
    setCurrentProduct(product);
    setIsContactModalOpen(true);
  };

  // Generate PDF for all items
  const generateInventoryPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Inventory Items Report', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    
    // Add item count
    doc.setFontSize(14);
    doc.text(`Total Items: ${products.length}`, 20, 30);
    
    // Table headers
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Item ID', 20, 40);
    doc.text('Name', 50, 40);
    doc.text('Category', 100, 40);
    doc.text('Count', 140, 40);
    doc.text('Price (Rs)', 170, 40);
    
    // Add horizontal line
    doc.line(20, 42, 190, 42);
    
    // Reset font
    doc.setFont(undefined, 'normal');
    
    // Table content
    let yPosition = 50;
    
    products.forEach((product, index) => {
      // Add new page if content exceeds page height
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        
        // Add headers to new page
        doc.setFont(undefined, 'bold');
        doc.text('Item ID', 20, yPosition);
        doc.text('Name', 50, yPosition);
        doc.text('Category', 100, yPosition);
        doc.text('Count', 140, yPosition);
        doc.text('Price (Rs)', 170, yPosition);
        
        // Add horizontal line
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        
        // Reset font and update yPosition
        doc.setFont(undefined, 'normal');
        yPosition += 10;
      }
      
      doc.text(product.ItemID?.toString() || 'N/A', 20, yPosition);
      doc.text(product.name?.substring(0, 20) || 'N/A', 50, yPosition);
      doc.text(product.catogory?.substring(0, 15) || 'N/A', 100, yPosition);
      doc.text(product.count?.toString() || '0', 140, yPosition);
      doc.text(product.price?.toString() || '0', 170, yPosition);
      
      yPosition += 10;
    });
    
    // Save the PDF
    doc.save('inventory-items.pdf');
  };

  // Generate PDF for single item details
  const generateItemDetailPDF = (product) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Item Details: ${product.name}`, 105, 15, { align: 'center' });
    
    // Add horizontal line
    doc.line(20, 20, 190, 20);
    
    // Add item details
    doc.setFontSize(12);
    let yPosition = 30;
    
    doc.setFont(undefined, 'bold');
    doc.text('ID:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(product.ItemID?.toString() || 'N/A', 50, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Name:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(product.name || 'N/A', 50, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Category:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(product.catogory || 'N/A', 50, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Count:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(product.count?.toString() || '0', 50, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Price:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(`Rs. ${product.price?.toString() || '0'}`, 50, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('Description:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    
    // Handle multiline description
    const description = product.description || 'No description available';
    const splitText = doc.splitTextToSize(description, 150);
    doc.text(splitText, 50, yPosition);
    
    // Save the PDF
    doc.save(`item-${product.ItemID}-details.pdf`);
  };

  // Function to show Low Stock Alert Banner if there are low stock items
  const LowStockAlert = () => {
    if (lowStockItems.length > 0) {
      return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">Low Stock Alert</p>
              <p>{lowStockItems.length} items have low stock (count ≤ 5) and need to be reordered.</p>
            </div>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition duration-300"
            >
              Contact Suppliers
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      {/* Item Count Banner */}
      <div className="bg-blue-100 text-blue-800 text-center py-2 text-lg font-semibold">
        Total Items in Inventory: {products.length} | Filtered Items: {filteredProducts.length}
      </div>

      {/* Low Stock Alert Banner */}
      <LowStockAlert />

      {/* PDF Export and Contact Supplier Button */}
      <div className="p-4 flex justify-between items-center">
        <button 
          onClick={generateInventoryPDF}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition duration-300"
        >
          Export Inventory PDF
        </button>
        
        <div className="flex-grow mx-4">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-50 p-4 border-t border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-mdbg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div className="flex gap-2 min-w-48">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Price</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                placeholder="Min"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Price</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                placeholder="Max"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Stock Status Filter */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700">Stock Status</label>
            <select
              value={countFilter}
              onChange={(e) => setCountFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="all">All Items</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="lowStock">Low Stock (≤ 5)</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="none">Default</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="nameAZ">Name: A to Z</option>
              <option value="nameZA">Name: Z to A</option>
              <option value="countLow">Count: Low to High</option>
              <option value="countHigh">Count: High to Low</option>
            </select>
          </div>
          
          {/* Reset Filters Button */}
          <div className="mt-6">
            <button 
              onClick={resetFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <SupplierContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)}
        product={currentProduct} // Pass the current product to the modal
      />

      <div className="flex-grow p-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>

        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 text-xl">
            No products found matching your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <img 
                  className="w-full h-64 object-cover object-center" 
                  src={`http://localhost:5000/images/${product.filepath}`} 
                  alt={product.name}
                />
                <div className="p-4">
                  <p className="text-xl font-bold mb-2">Name: {product.name}</p>
                  <p className="text-xl font-bold mb-2">Id: {product.ItemID}</p>
                  <p className="text-xl font-bold mb-2">Category: {product.catogory}</p>
                  <p className="text-xl font-bold mb-2">
                    Count: {product.count}
                    {product.count === 0 && <span className="ml-2 text-sm text-white bg-red-500 px-2 py-1 rounded">Out of Stock</span>}
                    {product.count > 0 && product.count <= 5 && <span className="ml-2 text-sm text-white bg-yellow-500 px-2 py-1 rounded">Low Stock</span>}
                  </p>
                  <p className="text-gray-700 mb-2">Description: {product.description}</p>
                  <p className="text-gray-900 font-bold mb-4">Rs.{product.price}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <button 
                      onClick={() => generateItemDetailPDF(product)}
                      className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-300"
                    >
                      Export Details PDF
                    </button>
                    
                    {/* Display Contact Supplier button only for low-stock items */}
                    {product.count > 0 && product.count <= 5 && (
                      <button 
                        onClick={() => openContactModal(product)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300"
                      >
                        Order More
                      </button>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link 
                      to={`/edit-item/${product._id}`} 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                    >
                      Edit
                    </Link>
                    
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
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

export default Shop;