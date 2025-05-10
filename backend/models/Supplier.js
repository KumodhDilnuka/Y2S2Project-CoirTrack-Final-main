/* backend/models/Supplier.js
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
*/
// backend/models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  contact: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Contact number must be exactly 10 digits.']
  },
  location: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  supplyItems: { type: [String], required: true },
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Supplier', supplierSchema);