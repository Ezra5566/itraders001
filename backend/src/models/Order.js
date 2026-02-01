const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  image: String,
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'Kenya' },
  phone: String,
}, { _id: false });

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    required: true,
  },
  note: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Customer Info
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
  },
  
  // Items
  items: [orderItemSchema],
  
  // Addresses
  shippingAddress: {
    type: addressSchema,
    required: true,
  },
  billingAddress: {
    type: addressSchema,
    required: true,
  },
  
  // Financial
  subtotal: {
    type: Number,
    required: true,
  },
  shippingCost: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    code: String,
    amount: { type: Number, default: 0 },
  },
  total: {
    type: Number,
    required: true,
  },
  
  // Payment
  payment: {
    method: {
      type: String,
      enum: ['card', 'mpesa', 'bank_transfer', 'cash_on_delivery', 'paypal'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    transactionId: String,
    paidAt: Date,
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partially_fulfilled', 'fulfilled'],
    default: 'unfulfilled',
  },
  
  // Shipping
  shipping: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date,
  },
  
  // Timeline
  timeline: [timelineSchema],
  
  // Notes
  notes: {
    customer: String,
    internal: String,
  },
  
  // Flags
  isPaid: {
    type: Boolean,
    default: false,
  },
  isShipped: {
    type: Boolean,
    default: false,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  
  // Refund
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
  },
  
  // IP Address for fraud detection
  ipAddress: String,
  
  // User Agent
  userAgent: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes (orderNumber already indexed via unique: true)
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = 'ITR';
    const timestamp = date.getFullYear().toString().substr(-2) +
                     String(date.getMonth() + 1).padStart(2, '0') +
                     String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `${prefix}-${timestamp}-${random}`;
  }
  
  // Add to timeline if status changed
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  
  next();
});

// Methods
orderSchema.methods.updateStatus = function(status, note, updatedBy) {
  this.status = status;
  
  if (status === 'paid') {
    this.isPaid = true;
    this.payment.status = 'completed';
    this.payment.paidAt = new Date();
  }
  
  if (status === 'shipped') {
    this.isShipped = true;
    this.fulfillmentStatus = 'fulfilled';
  }
  
  if (status === 'delivered') {
    this.isDelivered = true;
    this.shipping.deliveredAt = new Date();
  }
  
  if (status === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  this.timeline.push({
    status,
    note,
    updatedBy,
    timestamp: new Date(),
  });
  
  return this.save();
};

orderSchema.methods.addTracking = function(carrier, trackingNumber, trackingUrl, estimatedDelivery) {
  this.shipping = {
    carrier,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
  };
  return this.save();
};

// Statics
orderSchema.statics.getSalesStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ['cancelled', 'refunded'] },
        isPaid: true,
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$total' },
        orderCount: { $sum: 1 },
        averageOrder: { $avg: '$total' },
      },
    },
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
