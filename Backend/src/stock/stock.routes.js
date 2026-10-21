const router = require('express').Router();
const { requireAuth, requireAdmin } = require('../auth/auth.middleware');
const { getStock, addStockQuantity } = require('./stock.controller');
router.get('/', requireAuth, getStock);
router.post('/:productId/add', requireAuth, requireAdmin, addStockQuantity);
module.exports = router;
