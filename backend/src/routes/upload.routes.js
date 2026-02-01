const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes (require admin)
router.use(authenticate, authorize('admin', 'superadmin'));

router.post('/image', uploadController.uploadImage);
router.post('/images', uploadController.uploadMultiple);
router.use(uploadController.handleMulterError);

module.exports = router;
