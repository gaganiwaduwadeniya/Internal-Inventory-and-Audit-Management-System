const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getAuditLogById,
  getUserAuditLogs,
  deleteAuditLog
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

// All audit log routes require authentication and Admin role
router.use(protect, authorize('Admin'));

// Get all audit logs with pagination and filtering
router.get('/', getAuditLogs);

// Get audit logs for specific user
router.get('/user/:userId', getUserAuditLogs);

// Get single audit log
router.get('/:id', getAuditLogById);

// Delete audit log (for compliance)
router.delete('/:id', deleteAuditLog);

module.exports = router;
