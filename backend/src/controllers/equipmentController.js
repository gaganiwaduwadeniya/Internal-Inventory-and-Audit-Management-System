const Equipment = require('../models/Equipment');

// @route   POST /api/equipment
// @desc    Create equipment record
// @access  Private/Employee
exports.createEquipment = async (req, res) => {
  try {
    const { deviceName, serialNumber, assignedDate } = req.body;

    if (!deviceName || !serialNumber || !assignedDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if serial number already exists
    const existing = await Equipment.findOne({ serialNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Serial number already exists' });
    }

    const equipment = new Equipment({
      deviceName,
      serialNumber,
      assignedDate,
      assignedTo: req.user.id,
      status: 'Active'
    });

    await equipment.save();

    res.status(201).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/equipment
// @desc    Get all equipment (admin) or user's equipment (employee)
// @desc    Supports pagination and filtering
// @access  Private
exports.getEquipment = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering parameters
    const { status, search } = req.query;

    let filter = {};

    // Role-based filtering
    if (req.user.role === 'Admin') {
      // Admin can see all equipment
      filter = {};
    } else {
      // Employee can only see their own
      filter = { assignedTo: req.user.id };
    }

    // Status filter
    if (status && ['Active', 'Damaged', 'Retired'].includes(status)) {
      filter.status = status;
    }

    // Search filter (by device name or serial number)
    if (search) {
      filter.$or = [
        { deviceName: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Equipment.countDocuments(filter);

    // Get paginated equipment
    const equipment = await Equipment.find(filter)
      .populate('assignedTo', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: equipment.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/equipment/:id
// @desc    Get single equipment record
// @access  Private
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('assignedTo', 'username email role');

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    // Check ownership (employee can only see their own, admin can see all)
    if (req.user.role !== 'Admin' && equipment.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resource' });
    }

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/equipment/:id
// @desc    Update equipment record (admin only for status)
// @access  Private/Admin
exports.updateEquipment = async (req, res) => {
  try {
    const { status } = req.body;

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (status && ['Active', 'Damaged', 'Retired'].includes(status)) {
      equipment.status = status;
    }

    equipment.updatedAt = Date.now();
    await equipment.save();

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/equipment/:id
// @desc    Delete equipment record
// @access  Private/Admin
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
