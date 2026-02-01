const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:slug', categoryController.getCategory);

// Admin routes
router.post('/', authenticate, authorize('admin', 'superadmin'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin', 'superadmin'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), categoryController.deleteCategory);

module.exports = router;
