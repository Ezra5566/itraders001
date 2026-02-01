const { Category, Product, ActivityLog } = require('../models');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true, parent: null })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        options: { sort: { order: 1 } },
      })
      .sort({ order: 1 })
      .lean();

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
exports.getCategoryTree = async (req, res, next) => {
  try {
    const tree = await Category.getTree();

    res.json({
      success: true,
      data: { categories: tree },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
      })
      .lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Get products in this category
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const sort = req.query.sort || '-createdAt';

    const products = await Product.find({
      category: category._id,
      status: 'active',
    })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name slug price comparePrice images rating brand')
      .lean();

    const total = await Product.countDocuments({
      category: category._id,
      status: 'active',
    });

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    await ActivityLog.create({
      user: req.user.id,
      action: 'category_created',
      entityType: 'category',
      entityId: category._id,
      description: `Created category: ${category.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await ActivityLog.create({
      user: req.user.id,
      action: 'category_updated',
      entityType: 'category',
      entityId: category._id,
      description: `Updated category: ${category.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products',
      });
    }

    await category.deleteOne();

    await ActivityLog.create({
      user: req.user.id,
      action: 'category_deleted',
      entityType: 'category',
      entityId: category._id,
      description: `Deleted category: ${category.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
