const AuditLog = require('../models/AuditLog');

const logAuditAction = async (req, action, resourceType, resourceId = null, status = 'SUCCESS', errorMessage = null) => {
  try {
    const auditLog = new AuditLog({
      userId: req.user?.id || null,
      action,
      resourceType,
      resourceId,
      status,
      errorMessage,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      details: {
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
      }
    });

    await auditLog.save();
  } catch (error) {
    console.error('Error logging audit action:', error.message);
  }
};

module.exports = { logAuditAction };
