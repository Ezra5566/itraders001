const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  name: String,
  image: String,
  sku: String,
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtuals
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

cartSchema.virtual('discountAmount').get(function() {
  if (!this.coupon) return 0;
  const subtotal = this.subtotal;
  if (this.coupon.discountType === 'percentage') {
    return Math.round((subtotal * this.coupon.discount / 100) * 100) / 100;
  }
  return Math.min(this.coupon.discount, subtotal);
});

cartSchema.virtual('total').get(function() {
  return this.subtotal - this.discountAmount;
});

// Methods
cartSchema.methods.addItem = function(product, quantity = 1, variant = null) {
  const itemIndex = this.items.findIndex(item => {
    if (variant) {
      return item.product.toString() === product._id.toString() &&
             item.variant && item.variant.toString() === variant._id.toString();
    }
    return item.product.toString() === product._id.toString() && !item.variant;
  });

  const price = variant ? variant.price : product.price;
  const name = product.name;
  const image = product.primaryImage;
  const sku = variant ? variant.sku : product.sku;

  if (itemIndex > -1) {
    this.items[itemIndex].quantity += quantity;
  } else {
    this.items.push({
      product: product._id,
      variant: variant ? variant._id : null,
      quantity,
      price,
      name,
      image,
      sku,
    });
  }

  return this.save();
};

cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId);
  return this.save();
};

cartSchema.methods.updateQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

cartSchema.methods.clear = function() {
  this.items = [];
  this.coupon = null;
  return this.save();
};

cartSchema.methods.applyCoupon = function(code, discount, discountType) {
  this.coupon = { code, discount, discountType };
  return this.save();
};

cartSchema.methods.removeCoupon = function() {
  this.coupon = null;
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
