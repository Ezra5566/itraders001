const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes (require authentication)
router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/cancel', orderController.cancelOrder);
router.post('/payment-intent', orderController.createPaymentIntent);

// Admin routes
router.get('/admin/all', authorize('admin', 'superadmin'), orderController.getAllOrders);
router.put('/:id/status', authorize('admin', 'superadmin'), orderController.updateStatus);
router.put('/:id/tracking', authorize('admin', 'superadmin'), orderController.addTracking);

module.exports = router;
