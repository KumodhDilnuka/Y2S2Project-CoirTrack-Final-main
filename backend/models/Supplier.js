// backend/models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  contact: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  supplyItems: { type: [String], required: true },
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Supplier', supplierSchema);