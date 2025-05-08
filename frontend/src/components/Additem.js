import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Lottie from 'react-lottie';
import animationData from './Images/Animation - 1711108589839.json';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AddEmployee() {
  const [ItemID, setItemID] = useState("");
  const [name, setName] = useState("");
  const [filepath, setFilepath] = useState("");
  const [price, setPrice] = useState("");
  const [catogory, setCatogory] = useState("");
  const [description, setDescription] = useState("");
  const [count, setCount] = useState("");
  const [join, setJoin] = useState(getCurrentDate());
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    ItemID: false,
    name: false,
    filepath: false,
    price: false,
    catogory: false,
    description: false,
    count: false
  });

  // Function to get current date
  function getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Set current date on component mount
  useEffect(() => {
    setJoin(getCurrentDate());
  }, []);

  // Live validation for each field
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
          if (!value.trim()) {
            error = "Price is required";
          } else if (isNaN(Number(value))) {
            error = "Price must be a number";
          } else if (Number(value) <= 0) {
            error = "Price must be a positive number";
          }
          break;
          
        case "catogory":
          if (!value) {
            error = "Category is required";
          }
          break;
          
        case "description":
          if (!value.trim()) {
            error = "Description is required";
          } else if (value.trim().length < 20) {
            error = "Description should be at least 20 characters";
          }
          break;
          
        case "count":
          if (!value.trim()) {
            error = "Count is required";
          } else if (isNaN(Number(value))) {
            error = "Count must be a number";
          } else if (!Number.isInteger(Number(value))) {
            error = "Count must be a whole number";
          } else if (Number(value) < 0) {
            error = "Count cannot be negative";
          }
          break;
          
        case "filepath":
          if (!value) {
            error = "Image is required";
          }
          break;
          
        default:
          break;
      }
      
      return error;
    };

    // Create new errors object
    const newErrors = {};
    
    // Validate only touched fields
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        // Get field value safely without using eval
        const getFieldValue = (fieldName) => {
          const valueMap = {
            ItemID,
            name,
            filepath,
            price,
            catogory,
            description,
            count
          };
          return valueMap[fieldName];
        };
        
        const fieldValue = getFieldValue(field);
        const error = validateField(field, fieldValue);
        if (error) {
          newErrors[field] = error;
        }
      }
    });
    
    setErrors(newErrors);
  }, [ItemID, name, filepath, price, catogory, description, count, touched]);

  // Mark field as touched on blur
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validate form before submission
  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(touched).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    const newErrors = {};
    
    if (!ItemID.trim()) {
      newErrors.ItemID = "Item ID is required";
    } else if (!/^[A-Za-z0-9]+$/.test(ItemID)) {
      newErrors.ItemID = "Item ID should only contain letters and numbers";
    }

    if (!name.trim()) {
      newErrors.name = "Item Name is required";
    }

    if (!filepath) {
      newErrors.filepath = "Image is required";
    }

    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(price))) {
      newErrors.price = "Price must be a number";
    } else if (Number(price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!catogory) {
      newErrors.catogory = "Category is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description should be at least 10 characters";
    }

    if (!count.trim()) {
      newErrors.count = "Count is required";
    } else if (isNaN(Number(count))) {
      newErrors.count = "Count must be a number";
    } else if (!Number.isInteger(Number(count))) {
      newErrors.count = "Count must be a whole number";
    } else if (Number(count) < 0) {
      newErrors.count = "Count cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload
  const handleImage = (e) => {
    setFilepath(e.target.files[0]);
    setTouched(prev => ({ ...prev, filepath: true }));
  };

  // Validate price input to prevent negative numbers
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);
    setTouched(prev => ({ ...prev, price: true }));
  };

  // Validate count input to allow only integers
  const handleCountChange = (e) => {
    const value = e.target.value;
    setCount(value);
    setTouched(prev => ({ ...prev, count: true }));
  };

  // Submit form data
  const sendData = (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    const formData = new FormData();
    formData.append("ItemID", ItemID);
    formData.append("name", name);
    formData.append("filepath", filepath);
    formData.append("count", count);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("catogory", catogory);
    formData.append("join", join);

    axios
      .post("http://localhost:5000/item/add", formData)
      .then(() => {
        toast.success("Item Added Successfully!", { theme: "colored" });
        // Reset form after successful submission
        resetForm();
      })
      .catch((err) => {
        toast.error("Error adding item: " + err.message);
      });
  };

  // Reset form to initial state
  const resetForm = () => {
    setItemID("");
    setName("");
    setFilepath("");
    setPrice("");
    setCatogory("");
    setDescription("");
    setCount("");
    setJoin(getCurrentDate());
    setErrors({});
    setTouched({
      ItemID: false,
      name: false,
      filepath: false,
      price: false,
      catogory: false,
      description: false,
      count: false
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: `url("../images/finance-background.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container" style={{display:"flex"}}>
        <ToastContainer />
        <div className="container" style={{ display: "flex" }}>
          <div style={{ width: '500px', height: '500px', marginTop: '10px' , marginRight: '50px'}}>
            <Lottie options={{ loop: true, autoplay: true, animationData: animationData }} />
          </div>
          
          <div 
            className="addEmployeeForm" 
            style={{
              boxShadow: "0 0 10px 0 white",
              padding: "20px",
              borderRadius: "10px",
              backgroundColor: "#F5F5F5",
              outline: "2px solid blue",
              width:"1000px"
            }}
          >
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl white:text-dark">
              Add New Item
            </h1>
            <form onSubmit={sendData}>
              {/* Item ID Input */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 white:text-dark">
                  Item ID:
                </label>
                <input
                  className={`bg-gray-50 border ${errors.ItemID ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  type="text"
                  placeholder="Enter Item ID"
                  value={ItemID}
                  onChange={(e) => setItemID(e.target.value)}
                  onBlur={() => handleBlur("ItemID")}
                />
                {errors.ItemID && (
                  <p className="text-red-500 text-sm mt-1">{errors.ItemID}</p>
                )}
              </div>

              {/* Item Name Input */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 white:text-dark">
                  Item Name:
                </label>
                <input
                  className={`bg-gray-50 border ${errors.name ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  type="text"
                  placeholder="Enter Item Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Image Upload Input */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 white:text-dark">
                  Upload Image:
                </label>
                <input 
                  className={`block w-full text-sm text-gray-900 border ${errors.filepath ? "border-red-500" : "border-gray-300"} rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400`}
                  type="file" 
                  onChange={handleImage} 
                />
                {errors.filepath && (
                  <p className="text-red-500 text-sm mt-1">{errors.filepath}</p>
                )}
              </div>

              {/* Price Input */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 white:text-dark">
                  Price:
                </label>
                <input 
                  className={`bg-gray-50 border ${errors.price ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  type="text"
                  placeholder="Enter Price"
                  value={price}
                  onChange={handlePriceChange}
                  onBlur={() => handleBlur("price")}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 white:text-dark">
                  Category:
                </label>
                <select
                  className={`bg-gray-50 border ${errors.catogory ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  value={catogory}
                  onChange={(e) => setCatogory(e.target.value)}
                  onBlur={() => handleBlur("catogory")}
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

              {/* Description Input */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 white:text-dark">
                  Description:
                </label>
                <textarea 
                  className={`bg-gray-50 border ${errors.description ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleBlur("description")}
                  rows="3"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Count Input */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 white:text-dark">
                  Count:
                </label>
                <input
                  className={`bg-gray-50 border ${errors.count ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  type="text"
                  placeholder="Enter Count"
                  value={count}
                  onChange={handleCountChange}
                  onBlur={() => handleBlur("count")}
                />
                {errors.count && (
                  <p className="text-red-500 text-sm mt-1">{errors.count}</p>
                )}
              </div>

              {/* Add Date Input */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 white:text-dark">
                  Add Date:
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="date"
                  value={join}
                  readOnly
                />
                <p className="text-gray-600 text-sm mt-1">Add date is automatically set to today's date</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  type="submit" 
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  Add
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-black dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                >
                  Reset
                </button>
                <Link 
                  to={"/itemsshow"} 
                  className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-black dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                >
                  Back
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}