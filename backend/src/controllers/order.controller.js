const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order, Cart, Product, ActivityLog } = require('../models');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
    } = req.body;

    // Get cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Validate inventory
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const availableInventory = item.variant 
        ? product.variants.id(item.variant)?.inventory 
        : product.inventory;

      if (availableInventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock. Only ${availableInventory} available.`,
        });
      }
    }

    // Calculate totals
    const subtotal = cart.subtotal;
    const shippingCost = subtotal > 5000 ? 0 : 300; // Free shipping over 5000
    const tax = Math.round(subtotal * 0.16); // 16% VAT
    const discount = cart.discountAmount;
    const total = subtotal + shippingCost + tax - discount;

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      variant: item.variant,
      name: item.name,
      sku: item.sku,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    // Create order
    const order = await Order.create({
      user: req.user.id,
      customer: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
      },
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal,
      shippingCost,
      tax,
      discount: {
        code: cart.coupon?.code,
        amount: discount,
      },
      total,
      payment: {
        method: paymentMethod,
      },
      notes: {
        customer: notes,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Update inventory
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (item.variant) {
        const variant = product.variants.id(item.variant);
        variant.inventory -= item.quantity;
      } else {
        product.inventory -= item.quantity;
      }
      product.salesCount += item.quantity;
      await product.save();
    }

    // Clear cart
    await cart.clear();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'order_created',
      entityType: 'order',
      entityId: order._id,
      description: `Order placed: ${order.orderNumber}`,
      metadata: { total: order.total },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('orderNumber status total payment.status createdAt items.name items.image items.quantity');

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: {
        orders,
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('items.product', 'name slug images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Can only cancel if not shipped
    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has been shipped',
      });
    }

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (item.variant) {
        const variant = product.variants.id(item.variant);
        if (variant) variant.inventory += item.quantity;
      } else {
        product.inventory += item.quantity;
      }
      product.salesCount -= item.quantity;
      await product.save();
    }

    await order.updateStatus('cancelled', reason);

    await ActivityLog.create({
      user: req.user.id,
      action: 'order_cancelled',
      entityType: 'order',
      entityId: order._id,
      description: `Order cancelled: ${order.orderNumber}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe payment intent
// @route   POST /api/orders/payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'kes',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Controllers

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { status, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
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

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await order.updateStatus(status, note, req.user.id);

    await ActivityLog.create({
      user: req.user.id,
      action: 'order_status_changed',
      entityType: 'order',
      entityId: order._id,
      description: `Order ${order.orderNumber} status changed to ${status}`,
      metadata: { oldStatus: order.status, newStatus: status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add tracking info (Admin)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
exports.addTracking = async (req, res, next) => {
  try {
    const { carrier, trackingNumber, trackingUrl, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await order.addTracking(carrier, trackingNumber, trackingUrl, new Date(estimatedDelivery));
    await order.updateStatus('shipped', `Shipped via ${carrier}. Tracking: ${trackingNumber}`, req.user.id);

    await ActivityLog.create({
      user: req.user.id,
      action: 'tracking_added',
      entityType: 'order',
      entityId: order._id,
      description: `Added tracking to order ${order.orderNumber}`,
      metadata: { carrier, trackingNumber },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Tracking information added',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
