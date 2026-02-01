const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All analytics routes require admin role
router.use(authenticate, authorize('admin', 'superadmin'));

router.get('/sales', analyticsController.getSalesAnalytics);
router.get('/customers', analyticsController.getCustomerAnalytics);
router.get('/products', analyticsController.getProductAnalytics);

module.exports = router;
