const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured/list', productController.getFeatured);
router.get('/search/query', productController.searchProducts);
router.get('/:slug', productController.getProduct);

// Protected routes (require authentication)
router.post('/:id/reviews', authenticate, productController.addReview);

// Admin routes
router.post('/', authenticate, authorize('admin', 'superadmin'), productController.createProduct);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), productController.deleteProduct);

module.exports = router;
