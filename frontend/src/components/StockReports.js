import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import authService from '../services/authService';

const StockReports = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('lowStock');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const fetchStocks = async () => {
    try {
      setLoading(true);
      // Set auth header for API calls
      authService.setAuthHeader();
      const response = await axios.get('http://localhost:5000/api/stocks');
      setStocks(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch stock data');
      setLoading(false);
    }
  };

  // Calculate total inventory value
  const totalInventoryValue = stocks.reduce((total, stock) => {
    return total + (stock.price * stock.quantity);
  }, 0);

  // Filter low stock items (less than 10 units)
  const lowStockItems = stocks.filter(stock => stock.quantity < 10);

  // Get stock by category
  const stockByCategory = stocks.reduce((categories, stock) => {
    if (!categories[stock.category]) {
      categories[stock.category] = {
        count: 0,
        value: 0
      };
    }
    categories[stock.category].count += 1;
    categories[stock.category].value += (stock.price * stock.quantity);
    return categories;
  }, {});

  const handleGenerateReport = () => {
    let reportData;
    
    // Determine which data to include based on report type
    switch(reportType) {
      case 'lowStock':
        reportData = lowStockItems;
        break;
      case 'inventory':
        reportData = stocks;
        break;
      case 'category':
        reportData = Object.keys(stockByCategory).map(category => ({
          category,
          count: stockByCategory[category].count,
          value: stockByCategory[category].value
        }));
        break;
      default:
        reportData = stocks;
    }
    
    // Generate HTML content for the PDF
    const reportTitle = `Stock Report - ${reportType} (${new Date().toLocaleDateString()})`;
    let tableHTML = '';
    
    if (reportType === 'lowStock') {
      tableHTML = `
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Category</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
          </tr>
          ${reportData.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.category}</td>
              <td style="border: 1px solid #ddd; padding: 8px; color: red; font-weight: bold;">${item.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">Rs.${item.price}</td>
            </tr>
          `).join('')}
        </table>
      `;
    } else if (reportType === 'category') {
      tableHTML = `
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Category</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Items Count</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Value</th>
          </tr>
          ${reportData.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.category}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.count}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">Rs.${item.value.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
      `;
    } else {
      tableHTML = `
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Category</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Value</th>
          </tr>
          ${reportData.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.category}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">Rs.${item.price}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">Rs.${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
      `;
    }
    
    // Create the complete HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #333366; }
          .summary { margin: 20px 0; }
          .summary-item { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <div class="summary">
          <div class="summary-item"><strong>Date Range:</strong> ${startDate || 'All time'} ${endDate ? `to ${endDate}` : ''}</div>
          <div class="summary-item"><strong>Total Items:</strong> ${stocks.length}</div>
          <div class="summary-item"><strong>Total Inventory Value:</strong> Rs.${totalInventoryValue.toFixed(2)}</div>
        </div>
        ${tableHTML}
      </body>
      </html>
    `;
    
    // Create a Blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open the HTML in a new tab - the browser's print dialog will allow saving as PDF
    const newWindow = window.open(url, '_blank');
    
    // Trigger print dialog after the page loads
    newWindow.onload = () => {
      newWindow.print();
      URL.revokeObjectURL(url);
    };
    
    toast.success('Report generated! Use your browser\'s print dialog to save as PDF');
  };

  const handleExportCSV = () => {
    let csvData;
    let fileName;
    
    // Prepare CSV data based on report type
    if (reportType === 'lowStock') {
      fileName = `low_stock_report_${new Date().toISOString().split('T')[0]}.csv`;
      csvData = [
        ['Name', 'Category', 'Quantity', 'Price (Rs.)'],
        ...lowStockItems.map(item => [
          item.name,
          item.category,
          item.quantity,
          item.price
        ])
      ];
    } else if (reportType === 'category') {
      fileName = `category_report_${new Date().toISOString().split('T')[0]}.csv`;
      csvData = [
        ['Category', 'Items Count', 'Total Value (Rs.)'],
        ...Object.keys(stockByCategory).map(category => [
          category,
          stockByCategory[category].count,
          stockByCategory[category].value.toFixed(2)
        ])
      ];
    } else {
      fileName = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
      csvData = [
        ['Name', 'Category', 'Quantity', 'Price (Rs.)', 'Total Value (Rs.)'],
        ...stocks.map(item => [
          item.name,
          item.category,
          item.quantity,
          item.price,
          (item.price * item.quantity).toFixed(2)
        ])
      ];
    }
    
    // Convert to CSV string
    const csv = csvData.map(row => row.map(cell => {
      // If the cell contains commas, quotes, or newlines, wrap it in quotes
      if (cell && (cell.toString().includes(',') || cell.toString().includes('"') || cell.toString().includes('\n'))) {
        return `"${cell.toString().replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')).join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV file exported successfully');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Stock Reports</h1>
          <Link 
            to="/admin/stock" 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
          >
            Back to Stock Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-700 mb-1">Total Items</h3>
            <p className="text-2xl font-bold">{stocks.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-lg font-medium text-green-700 mb-1">Total Value</h3>
            <p className="text-2xl font-bold">Rs.{totalInventoryValue.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="text-lg font-medium text-red-700 mb-1">Low Stock Items</h3>
            <p className="text-2xl font-bold">{lowStockItems.length}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="lowStock">Low Stock</option>
                <option value="inventory">Inventory Value</option>
                <option value="category">By Category</option>
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate PDF Report
            </button>
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export to CSV
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Stock by Category</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Count</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.keys(stockByCategory).map((category) => (
                  <tr key={category}>
                    <td className="px-6 py-4 whitespace-nowrap">{category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stockByCategory[category].count}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Rs.{stockByCategory[category].value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Low Stock Items</h2>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-500">No items with low stock.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockItems.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">Rs.{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockReports; 