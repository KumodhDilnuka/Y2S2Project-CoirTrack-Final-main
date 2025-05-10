/*const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/stocks
// @desc    Get all stocks
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/stocks
// @desc    Add a new stock
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;
    
    const stock = new Stock({
      name,
      quantity,
      price,
      category,
    });

    const savedStock = await stock.save();
    res.status(201).json(savedStock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/stocks/:id
// @desc    Get stock by ID
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    
    res.json(stock);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/stocks/:id
// @desc    Update a stock
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;
    
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    
    stock.name = name || stock.name;
    stock.quantity = quantity || stock.quantity;
    stock.price = price || stock.price;
    stock.category = category || stock.category;

    const updatedStock = await stock.save();
    res.json(updatedStock);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/stocks/:id
// @desc    Delete a stock
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    
    await stock.deleteOne();
    res.json({ message: "Stock removed" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router; 
*/

// backend/routes/stockRoutes.js
const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/stocks
// @desc    Get all stocks
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const stocks = await Stock.find({});
    res.json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/stocks
// @desc    Add a new stock
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;
    
    const stock = new Stock({
      name,
      quantity,
      price,
      category,
    });

    const savedStock = await stock.save();
    res.status(201).json(savedStock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// @route   GET /api/stocks/:id
// @desc    Get stock by ID
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    
    res.json(stock);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/stocks/:id
// @desc    Update a stock
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;
    
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    
    stock.name = name || stock.name;
    stock.quantity = quantity || stock.quantity;
    stock.price = price || stock.price;
    stock.category = category || stock.category;

    const updatedStock = await stock.save();
    res.json(updatedStock);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(500).json({ message: error.message || "Server Error" });
  }
});

// @route   DELETE /api/stocks/:id
// @desc    Delete a stock
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    
    await stock.deleteOne();
    res.json({ message: "Stock removed" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;