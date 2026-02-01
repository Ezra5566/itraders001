const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  inventory: {
    type: Number,
    default: 0,
    min: 0,
  },
  attributes: [{
    name: String,
    value: String,
  }],
  images: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: String,
  comment: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  shortDescription: {
    type: String,
    maxlength: 500,
  },
  brand: {
    type: String,
    required: true,
    enum: ['Apple', 'Samsung', 'Sony', 'Microsoft', 'Google', 'Huawei', 'Xiaomi', 'Other'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  tags: [String],
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  comparePrice: {
    type: Number,
    min: 0,
  },
  costPrice: {
    type: Number,
    min: 0,
    select: false,
  },
  
  // Inventory
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  inventory: {
    type: Number,
    default: 0,
    min: 0,
  },
  inventoryPolicy: {
    type: String,
    enum: ['deny', 'continue'],
    default: 'deny',
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  
  // Variants
  hasVariants: {
    type: Boolean,
    default: false,
  },
  variants: [variantSchema],
  variantAttributes: [{
    name: String,
    values: [String],
  }],
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false },
  }],
  videos: [{
    url: String,
    thumbnail: String,
  }],
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  
  // Features
  features: [{
    title: String,
    description: String,
    icon: String,
  }],
  specifications: [{
    name: String,
    value: String,
  }],
  
  // Reviews
  reviews: [reviewSchema],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  
  // Sales
  salesCount: {
    type: Number,
    default: 0,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  
  // Shipping
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  
  // Warranty
  warranty: {
    duration: Number, // in months
    description: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes (slug already indexed via unique: true)
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : this.images[0]?.url || '';
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  if (this.hasVariants) {
    return this.variants.some(v => v.isActive && v.inventory > 0);
  }
  return this.inventory > 0;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  
  // Update rating average
  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating.average = Math.round((total / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;
  }
  
  next();
});

// Static methods
productSchema.statics.findFeatured = function(limit = 8) {
  return this.find({ status: 'active', isFeatured: true })
    .populate('category', 'name slug')
    .limit(limit)
    .lean();
};

productSchema.statics.findByCategory = function(categoryId, options = {}) {
  const { page = 1, limit = 12, sort = '-createdAt' } = options;
  return this.find({ category: categoryId, status: 'active' })
    .populate('category', 'name slug')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

productSchema.statics.search = function(query, options = {}) {
  const { page = 1, limit = 12 } = options;
  return this.find(
    { $text: { $search: query }, status: 'active' },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('Product', productSchema);
