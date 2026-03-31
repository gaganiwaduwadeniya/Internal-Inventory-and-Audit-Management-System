const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  assignedDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Damaged', 'Retired'],
    default: 'Active'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
