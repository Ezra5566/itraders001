const { Cart, Product } = require('../models');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images inventory status');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variantId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available',
      });
    }

    // Find variant if specified
    let variant = null;
    if (variantId && product.hasVariants) {
      variant = product.variants.id(variantId);
      if (!variant || !variant.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found',
        });
      }
    }

    // Check inventory
    const availableInventory = variant ? variant.inventory : product.inventory;
    if (availableInventory < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableInventory} items available`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Add item
    await cart.addItem(product, quantity, variant);

    // Re-populate and return
    cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    // Check product inventory
    const product = await Product.findById(item.product);
    const availableInventory = item.variant 
      ? product.variants.id(item.variant)?.inventory 
      : product.inventory;

    if (availableInventory < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableInventory} items available`,
      });
    }

    await cart.updateQuantity(req.params.itemId, quantity);

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Cart updated',
      data: { cart: updatedCart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.removeItem(req.params.itemId);

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { cart: updatedCart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      await cart.clear();
    }

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    // TODO: Implement coupon validation logic
    // This is a placeholder - implement actual coupon system
    const validCoupons = {
      'WELCOME10': { discount: 10, discountType: 'percentage' },
      'SAVE20': { discount: 20, discountType: 'fixed' },
    };

    const coupon = validCoupons[code.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.applyCoupon(code.toUpperCase(), coupon.discount, coupon.discountType);

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Coupon applied',
      data: { cart: updatedCart },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.removeCoupon();

    const updatedCart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Coupon removed',
      data: { cart: updatedCart },
    });
  } catch (error) {
    next(error);
  }
};
