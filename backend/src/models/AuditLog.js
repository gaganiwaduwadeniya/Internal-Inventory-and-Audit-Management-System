const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'USER_REGISTERED',
      'USER_LOGGED_IN',
      'EQUIPMENT_CREATED',
      'EQUIPMENT_UPDATED',
      'EQUIPMENT_DELETED',
      'EQUIPMENT_VIEWED',
      'UNAUTHORIZED_ACCESS_ATTEMPT'
    ],
    required: true
  },
  resourceType: {
    type: String,
    enum: ['User', 'Equipment'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    default: 'SUCCESS'
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
