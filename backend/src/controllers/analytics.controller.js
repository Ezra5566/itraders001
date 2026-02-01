const { Order, Product, User } = require('../models');

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      switch (period) {
        case 'week':
          dateFilter = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
          break;
        case 'year':
          dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) };
          break;
        case 'all':
        default:
          dateFilter = {};
      }
    }

    // Sales by day
    const salesByDay = await Order.aggregate([
      {
        $match: {
          createdAt: dateFilter,
          status: { $nin: ['cancelled', 'refunded'] },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Sales by category
    const salesByCategory = await Order.aggregate([
      {
        $match: {
          createdAt: dateFilter,
          status: { $nin: ['cancelled', 'refunded'] },
          isPaid: true,
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          sales: { $sum: '$items.subtotal' },
          quantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { sales: -1 } },
    ]);

    // Sales by brand
    const salesByBrand = await Order.aggregate([
      {
        $match: {
          createdAt: dateFilter,
          status: { $nin: ['cancelled', 'refunded'] },
          isPaid: true,
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.brand',
          sales: { $sum: '$items.subtotal' },
          quantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { sales: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        salesByDay,
        salesByCategory,
        salesByBrand,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private/Admin
exports.getCustomerAnalytics = async (req, res, next) => {
  try {
    // New customers by month
    const newCustomers = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top customers by order value
    const topCustomers = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled', 'refunded'] },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalSpent: 1,
          orders: 1,
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          email: '$user.email',
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        newCustomers,
        topCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private/Admin
exports.getProductAnalytics = async (req, res, next) => {
  try {
    // Top selling products
    const topSelling = await Product.find({ status: 'active' })
      .sort({ salesCount: -1 })
      .limit(10)
      .select('name salesCount viewsCount inventory price images');

    // Low stock products
    const lowStock = await Product.find({
      status: 'active',
      $or: [
        { inventory: { $lt: 5 }, hasVariants: false },
        { hasVariants: true, 'variants.inventory': { $lt: 5 } }
      ]
    })
      .select('name inventory hasVariants variants price images')
      .limit(20);

    // Most viewed products
    const mostViewed = await Product.find({ status: 'active' })
      .sort({ viewsCount: -1 })
      .limit(10)
      .select('name viewsCount salesCount price images');

    res.json({
      success: true,
      data: {
        topSelling,
        lowStock,
        mostViewed,
      },
    });
  } catch (error) {
    next(error);
  }
};
