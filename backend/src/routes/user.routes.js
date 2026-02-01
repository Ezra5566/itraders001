const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

// User routes (authenticated)
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/addresses', authenticate, userController.addAddress);
router.put('/addresses/:addressId', authenticate, userController.updateAddress);
router.delete('/addresses/:addressId', authenticate, userController.deleteAddress);
router.post('/wishlist', authenticate, userController.addToWishlist);
router.delete('/wishlist/:productId', authenticate, userController.removeFromWishlist);

// Admin routes
router.get('/', authenticate, authorize('admin', 'superadmin'), userController.getAllUsers);
router.get('/:id', authenticate, authorize('admin', 'superadmin'), userController.getUser);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), userController.updateUser);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), userController.deleteUser);

module.exports = router;
