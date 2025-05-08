import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State for form fields
    const [itemData, setItemData] = useState({
        ItemID: '',
        name: '',
        price: '',
        catogory: '',
        description: '',
        count: '',
        join: '',
        currentImage: ''
    });

    // State for validation
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        ItemID: false,
        name: false,
        price: false,
        catogory: false,
        description: false,
        count: false
    });

    // State for file upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch item details when component mounts
    useEffect(() => {
        const fetchItemDetails = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/item/`);
                // Find the specific item by ID
                const item = response.data.find(item => item._id === id);
                
                if (item) {
                    setItemData({
                        ItemID: item.ItemID,
                        name: item.name,
                        price: item.price,
                        catogory: item.catogory,
                        description: item.description,
                        count: item.count,
                        join: item.join,
                        currentImage: item.filepath
                    });
                } else {
                    toast.error("Item not found!");
                    navigate('/itemsshow');
                }
            } catch (error) {
                console.error('Error fetching item details:', error);
                toast.error("Failed to fetch item details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchItemDetails();
    }, [id, navigate]);

    // Live validation effect
    useEffect(() => {
        const validateField = (field, value) => {
            let error = "";
            
            switch (field) {
                case "ItemID":
                    if (!value.trim()) {
                        error = "Item ID is required";
                    } else if (!/^[A-Za-z0-9]+$/.test(value)) {
                        error = "Item ID should only contain letters and numbers";
                    }
                    break;
                    
                case "name":
                    if (!value.trim()) {
                        error = "Item Name is required";
                    }
                    break;
                    
                case "price":
                    if (!value.toString().trim()) {
                        error = "Price is required";
                    } else if (isNaN(Number(value))) {
                        error = "Price must be a number";
                    } else if (Number(value) <= 0) {
                        error = "Price must be a positive number";
                    }
                    break;
                    
                case "catogory":
                    if (!value.trim()) {
                        error = "Category is required";
                    }
                    break;
                    
                case "description":
                    if (!value.trim()) {
                        error = "Description is required";
                    } else if (value.trim().length < 10) {
                        error = "Description should be at least 10 characters";
                    }
                    break;
                    
                case "count":
                    if (!value.toString().trim()) {
                        error = "Count is required";
                    } else if (isNaN(Number(value))) {
                        error = "Count must be a number";
                    } else if (!Number.isInteger(Number(value))) {
                        error = "Count must be a whole number";
                    } else if (Number(value) < 0) {
                        error = "Count cannot be negative";
                    }
                    break;
                    
                default:
                    break;
            }
            
            return error;
        };

        // Validate only touched fields
        const newErrors = {};
        Object.keys(touched).forEach(field => {
            if (touched[field]) {
                const error = validateField(field, itemData[field]);
                if (error) {
                    newErrors[field] = error;
                }
            }
        });
        
        setErrors(newErrors);
    }, [itemData, touched]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for price and count to prevent negative values
        if (name === 'price' || name === 'count') {
            // Allow empty string for validation to handle
            setItemData(prevState => ({
                ...prevState,
                [name]: value
            }));
        } else {
            setItemData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
        
        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    // Mark field as touched on blur
    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    // Handle file input
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Validate entire form
    const validateForm = () => {
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(touched).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);
        
        // Validate all fields
        const newErrors = {};
        
        if (!itemData.ItemID.trim()) {
            newErrors.ItemID = "Item ID is required";
        } else if (!/^[A-Za-z0-9]+$/.test(itemData.ItemID)) {
            newErrors.ItemID = "Item ID should only contain letters and numbers";
        }

        if (!itemData.name.trim()) {
            newErrors.name = "Item Name is required";
        }

        if (!itemData.price.toString().trim()) {
            newErrors.price = "Price is required";
        } else if (isNaN(Number(itemData.price))) {
            newErrors.price = "Price must be a number";
        } else if (Number(itemData.price) <= 0) {
            newErrors.price = "Price must be a positive number";
        }

        if (!itemData.catogory.trim()) {
            newErrors.catogory = "Category is required";
        }

        if (!itemData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (itemData.description.trim().length < 10) {
            newErrors.description = "Description should be at least 10 characters";
        }

        if (!itemData.count.toString().trim()) {
            newErrors.count = "Count is required";
        } else if (isNaN(Number(itemData.count))) {
            newErrors.count = "Count must be a number";
        } else if (!Number.isInteger(Number(itemData.count))) {
            newErrors.count = "Count must be a whole number";
        } else if (Number(itemData.count) < 0) {
            newErrors.count = "Count cannot be negative";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            toast.error("Please fix all errors before submitting");
            return;
        }

        // Create form data for file upload
        const formData = new FormData();
        formData.append('ItemID', itemData.ItemID);
        formData.append('name', itemData.name);
        formData.append('price', itemData.price);
        formData.append('catogory', itemData.catogory);
        formData.append('description', itemData.description);
        formData.append('count', itemData.count);
        formData.append('join', itemData.join);

        // Append file if selected
        if (selectedFile) {
            formData.append('filepath', selectedFile);
        }

        try {
            setIsLoading(true);
            // Send update request
            await axios.put(`http://localhost:5000/item/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Item updated successfully!");
            
            // Redirect back to shop or item list after a short delay to show the toast
            setTimeout(() => {
                navigate('/itemsshow');
            }, 2000);
        } catch (error) {
            console.error('Error updating item:', error);
            toast.error(`Error updating item: ${error.message || "Unknown error"}`);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <ToastContainer position="top-right" autoClose={3000} />
            <h2 className="text-2xl font-bold mb-6">Edit Item</h2>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                {/* Current Image Preview */}
                {itemData.currentImage && (
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Current Image</label>
                        <img 
                            src={`http://localhost:5000/images/${itemData.currentImage}`} 
                            alt="Current Item" 
                            className="w-full h-64 object-cover rounded border border-gray-300"
                        />
                    </div>
                )}

                {/* Input Fields */}
                <div className="grid gap-4">
                    <div className="mb-3">
                        <label className="block text-gray-700 mb-2">Item Code</label>
                        <input
                            type="text"
                            name="ItemID"
                            value={itemData.ItemID}
                            onChange={handleChange}
                            onBlur={() => handleBlur("ItemID")}
                            placeholder="Item ID"
                            className={`bg-gray-50 border ${errors.ItemID ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        />
                        {errors.ItemID && (
                            <p className="text-red-500 text-sm mt-1">{errors.ItemID}</p>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-gray-700 mb-2">Item Name</label>
                        <input
                            type="text"
                            name="name"
                            value={itemData.name}
                            onChange={handleChange}
                            onBlur={() => handleBlur("name")}
                            placeholder="Item Name"
                            className={`bg-gray-50 border ${errors.name ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-gray-700 mb-2">Price</label>
                        <input
                            type="text"
                            name="price"
                            value={itemData.price}
                            onChange={handleChange}
                            onBlur={() => handleBlur("price")}
                            placeholder="Price"
                            className={`bg-gray-50 border ${errors.price ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        />
                        {errors.price && (
                            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-gray-700 mb-2">Category</label>
                        <select
                            name="catogory"
                            value={itemData.catogory}
                            onChange={handleChange}
                            onBlur={() => handleBlur("catogory")}
                            className={`bg-gray-50 border ${errors.catogory ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        >
                            <option value="">Select Category</option>
                            <option value="Coir">Coir</option>
                            <option value="Wheat">Wheat</option>
                            <option value="Coco">Coco</option>
                        </select>
                        {errors.catogory && (
                            <p className="text-red-500 text-sm mt-1">{errors.catogory}</p>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={itemData.description}
                            onChange={handleChange}
                            onBlur={() => handleBlur("description")}
                            placeholder="Description"
                            rows="3"
                            className={`bg-gray-50 border ${errors.description ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-gray-700 mb-2">Count</label>
                        <input
                            type="text"
                            name="count"
                            value={itemData.count}
                            onChange={handleChange}
                            onBlur={() => handleBlur("count")}
                            placeholder="Count"
                            className={`bg-gray-50 border ${errors.count ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        />
                        {errors.count && (
                            <p className="text-red-500 text-sm mt-1">{errors.count}</p>
                        )}
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-gray-700 mb-2">Add Date</label>
                        <input
                            type="date"
                            name="join"
                            value={itemData.join}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            readOnly
                        />
                        <p className="text-gray-600 text-sm mt-1">Original add date (cannot be changed)</p>
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-gray-700 mb-2">Upload New Image (Optional)</label>
                        <input
                            type="file"
                            name="filepath"
                            onChange={handleFileChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            accept="image/jpeg,image/png,image/jpg"
                        />
                        <p className="text-gray-600 text-sm mt-1">Leave empty to keep current image</p>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating..." : "Update Item"}
                        </button>
                        
                        <Link 
                            to="/itemsshow" 
                            className="w-full bg-gray-300 text-gray-800 p-2 rounded text-center hover:bg-gray-400 transition duration-200"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditItem;