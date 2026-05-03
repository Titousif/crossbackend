const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.post('/seed', productController.seedProducts); // Temporary: no auth for testing
router.get('/:id', productController.getProductById);

// Protected routes (JWT required)
router.post('/', auth, productController.createProduct);

module.exports = router;
