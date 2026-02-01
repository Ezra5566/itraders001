const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Product actions
      'product_created',
      'product_updated',
      'product_deleted',
      'product_status_changed',
      'product_image_uploaded',
      
      // Order actions
      'order_created',
      'order_updated',
      'order_status_changed',
      'order_cancelled',
      'order_refunded',
      'tracking_added',
      
      // User actions
      'user_created',
      'user_updated',
      'user_deleted',
      'user_role_changed',
      'user_blocked',
      
      // Category actions
      'category_created',
      'category_updated',
      'category_deleted',
      
      // Admin actions
      'admin_login',
      'admin_logout',
      'settings_updated',
      
      // Other
      'login',
      'logout',
      'password_changed',
      'profile_updated',
    ],
  },
  entityType: {
    type: String,
    enum: ['product', 'order', 'user', 'category', 'settings', 'system', 'auth'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
  }],
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

// Indexes
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

// Static methods
activityLogSchema.statics.log = async function(data) {
  return this.create(data);
};

activityLogSchema.statics.getRecent = function(limit = 50, skip = 0) {
  return this.find()
    .populate('user', 'firstName lastName email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

activityLogSchema.statics.getByUser = function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

activityLogSchema.statics.getByEntity = function(entityType, entityId) {
  return this.find({ entityType, entityId })
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean();
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);
