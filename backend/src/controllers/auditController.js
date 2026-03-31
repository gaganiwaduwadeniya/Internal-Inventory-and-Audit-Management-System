const AuditLog = require('../models/AuditLog');

// @route   GET /api/audit-logs
// @desc    Get audit logs (Admin only)
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, userId, status } = req.query;

    // Build filter query
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    // Get total count
    const total = await AuditLog.countDocuments(filter);

    // Get paginated logs
    const logs = await AuditLog.find(filter)
      .populate('userId', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/audit-logs/:id
// @desc    Get single audit log record
// @access  Private/Admin
exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('userId', 'username email role');

    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/audit-logs/user/:userId
// @desc    Get audit logs for specific user
// @access  Private/Admin
exports.getUserAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments({ userId: req.params.userId });

    const logs = await AuditLog.find({ userId: req.params.userId })
      .populate('userId', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/audit-logs/:id
// @desc    Delete audit log (Admin only) - for compliance/cleanup
// @access  Private/Admin
exports.deleteAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    await AuditLog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Audit log deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
