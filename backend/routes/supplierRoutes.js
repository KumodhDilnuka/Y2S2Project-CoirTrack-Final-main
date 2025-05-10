/* backend/routes/supplierRoutes.js
const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/suppliers
// @desc    Add a new supplier
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const { supplierName, contact, location, email, supplyItems } = req.body;
    
    // Check if supplier with this email already exists
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ message: "Supplier with this email already exists" });
    }
    
    const supplier = new Supplier({
      supplierName,
      contact,
      location,
      email,
      supplyItems,
    });

    const savedSupplier = await supplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/suppliers/:id
// @desc    Update a supplier
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { supplierName, contact, location, email, supplyItems } = req.body;
    
    // Check if supplier with this email already exists and is different from current
    if (email) {
      const existingSupplier = await Supplier.findOne({ email });
      if (existingSupplier && existingSupplier._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Another supplier with this email already exists" });
      }
    }
    
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    
    supplier.supplierName = supplierName || supplier.supplierName;
    supplier.contact = contact || supplier.contact;
    supplier.location = location || supplier.location;
    supplier.email = email || supplier.email;
    supplier.supplyItems = supplyItems || supplier.supplyItems;

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/suppliers/:id
// @desc    Delete a supplier
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    
    await supplier.deleteOne();
    res.json({ message: "Supplier removed" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
*/
// backend/routes/supplierRoutes.js
const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const { protect, admin } = require('../middleware/auth');

// Helper validation function
const validateSupplierInput = ({ supplierName, contact, location, email, supplyItems }) => {
  const errors = [];

  if (!supplierName || !supplierName.trim()) errors.push("Supplier name is required.");
  if (!contact || !/^\d{10}$/.test(contact)) errors.push("Contact number must be exactly 10 digits.");
  if (!location || !location.trim()) errors.push("Location is required.");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required.");
  if (!Array.isArray(supplyItems) || supplyItems.length === 0 || supplyItems.some(item => !item.trim())) {
    errors.push("Supply items must be a non-empty array of strings.");
  }

  return errors;
};

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/suppliers
// @desc    Add a new supplier
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const { supplierName, contact, location, email, supplyItems } = req.body;

    const validationErrors = validateSupplierInput({ supplierName, contact, location, email, supplyItems });
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(" ") });
    }

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ message: "Supplier with this email already exists" });
    }

    const supplier = new Supplier({
      supplierName,
      contact,
      location,
      email,
      supplyItems,
    });

    const savedSupplier = await supplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/suppliers/:id
// @desc    Update a supplier
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { supplierName, contact, location, email, supplyItems } = req.body;

    const validationErrors = validateSupplierInput({ supplierName, contact, location, email, supplyItems });
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors.join(" ") });
    }

    if (email) {
      const existingSupplier = await Supplier.findOne({ email });
      if (existingSupplier && existingSupplier._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Another supplier with this email already exists" });
      }
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.supplierName = supplierName;
    supplier.contact = contact;
    supplier.location = location;
    supplier.email = email;
    supplier.supplyItems = supplyItems;

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/suppliers/:id
// @desc    Delete a supplier
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await supplier.deleteOne();
    res.json({ message: "Supplier removed" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;