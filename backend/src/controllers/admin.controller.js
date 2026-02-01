const { User, Product, Order, ActivityLog } = require('../models');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get counts
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } }),
      Product.countDocuments({ 
        status: 'active',
        $or: [
          { inventory: { $lt: 5 }, hasVariants: false },
          { hasVariants: true, 'variants.inventory': { $lt: 5 } }
        ]
      }),
    ]);

    // Get sales this month
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $nin: ['cancelled', 'refunded'] },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get sales this year
    const yearlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          status: { $nin: ['cancelled', 'refunded'] },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber status total createdAt customer');

    // Get top products
    const topProducts = await Product.find({ status: 'active' })
      .sort({ salesCount: -1 })
      .limit(5)
      .select('name price salesCount images slug');

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          pendingOrders,
          lowStockProducts,
          monthlySales: monthlySales[0] || { total: 0, count: 0 },
          yearlySales: yearlySales[0] || { total: 0, count: 0 },
        },
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getActivityLogs = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const { user, action, startDate, endDate } = req.query;

    const query = {};
    if (user) query.user = user;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
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

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    // In a real app, these would come from a Settings collection
    // For now, returning default settings
    const settings = {
      store: {
        name: 'ITraders Store',
        email: 'support@itraders.store',
        phone: '+254 700 000000',
        address: 'Nairobi, Kenya',
        currency: 'KES',
        taxRate: 16,
      },
      shipping: {
        freeShippingThreshold: 5000,
        defaultShippingCost: 300,
        expressShippingCost: 500,
      },
      email: {
        senderName: 'ITraders Store',
        senderEmail: 'noreply@itraders.store',
        orderConfirmation: true,
        shippingConfirmation: true,
        deliveryConfirmation: true,
      },
      social: {
        facebook: 'https://facebook.com/itraders',
        instagram: 'https://instagram.com/itraders',
        twitter: 'https://twitter.com/itraders',
        whatsapp: '+254700000000',
      },
    };

    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    // In a real app, this would update a Settings collection
    await ActivityLog.create({
      user: req.user.id,
      action: 'settings_updated',
      entityType: 'settings',
      description: 'Updated system settings',
      metadata: req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
