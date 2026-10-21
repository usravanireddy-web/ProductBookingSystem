const express = require('express');

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('./product.controller');

const router = express.Router();
const { requireAuth, requireAdmin } = require('../auth/auth.middleware');

router.route('/').get(requireAuth, getProducts).post(requireAuth, requireAdmin, createProduct);
router
  .route('/:id')
  .put(requireAuth, requireAdmin, updateProduct)
  .delete(requireAuth, requireAdmin, deleteProduct);

module.exports = router;
