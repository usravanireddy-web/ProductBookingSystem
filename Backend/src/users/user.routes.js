const router = require('express').Router();
const { requireAuth } = require('../auth/auth.middleware');
const { createUser, getShopState, updateCart, updateWishlist } = require('./user.controller');
router.get('/me/shop', requireAuth, getShopState);
router.put('/me/cart', requireAuth, updateCart);
router.put('/me/wishlist', requireAuth, updateWishlist);
router.post('/', requireAuth, createUser);
module.exports = router;
