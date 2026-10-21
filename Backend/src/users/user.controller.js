const bcrypt = require('bcryptjs');
const User = require('./user.model');
const jwt = require('jsonwebtoken');
const Product = require('../products/product.model');

const currentUser = async (username) => User.findOne({ username }).select('cart wishlist');
const ensureProductsExist = async (productIds) => {
  const uniqueIds = [...new Set(productIds)];
  const count = await Product.countDocuments({ productId: { $in: uniqueIds } });
  return count === uniqueIds.length;
};

const validateCustomer = (body = {}) => {
  const fullName = body.fullName?.trim();
  const username = body.username?.trim().toLowerCase();
  const mobileNumber = body.mobileNumber?.trim();
  const password = body.password;
  if (!fullName || fullName.length < 2) return { message: 'Enter your full name.' };
  if (!username || !/^\S+@\S+\.\S+$/.test(username))
    return { message: 'Enter a valid email address.' };
  if (!/^\d{10}$/.test(mobileNumber || ''))
    return { message: 'Enter a valid 10-digit mobile number.' };
  if (typeof password !== 'string' || password.length < 8)
    return { message: 'Password must be at least 8 characters.' };
  return { fullName, username, mobileNumber, password };
};

const registerCustomer = async (req, res, next) => {
  try {
    const values = validateCustomer(req.body);
    if (values.message) return res.status(400).json({ success: false, message: values.message });
    if (await User.exists({ username: values.username }))
      return res
        .status(409)
        .json({ success: false, message: 'An account with this email already exists.' });
    const user = await User.create({
      fullName: values.fullName,
      username: values.username,
      mobileNumber: values.mobileNumber,
      passwordHash: await bcrypt.hash(values.password, 12),
      role: 'user',
    });
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET || 'development-only-secret',
      { expiresIn: '8h' },
    );
    return res
      .status(201)
      .json({
        success: true,
        token,
        user: {
          username: user.username,
          role: user.role,
          fullName: user.fullName,
          mobileNumber: user.mobileNumber,
        },
      });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    if (req.user.username !== (process.env.ADMIN_USERNAME || 'admin').toLowerCase())
      return res
        .status(403)
        .json({ success: false, message: 'Only the admin can create user accounts.' });
    const username = req.body?.username?.trim().toLowerCase();
    const password = req.body?.password;
    if (!username || !/^\S+@\S+\.\S+$/.test(username))
      return res
        .status(400)
        .json({ success: false, message: 'Enter a valid email address for the username.' });
    if (typeof password !== 'string' || password.length < 8)
      return res
        .status(400)
        .json({ success: false, message: 'Password must be at least 8 characters.' });
    if (await User.exists({ username }))
      return res
        .status(409)
        .json({ success: false, message: 'A user with this username already exists.' });
    const user = await User.create({
      username,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'user',
    });
    return res
      .status(201)
      .json({ success: true, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    return next(error);
  }
};

const getShopState = async (req, res, next) => {
  try {
    const user = await currentUser(req.user.username);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, cart: user.cart || [], wishlist: user.wishlist || [] });
  } catch (error) {
    return next(error);
  }
};

const updateCart = async (req, res, next) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items))
      return res.status(400).json({ success: false, message: 'Cart items must be an array.' });
    const merged = new Map();
    for (const item of items) {
      const productId = item?.productId?.trim();
      const quantity = Number(item?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1)
        return res
          .status(400)
          .json({
            success: false,
            message: 'Each cart item needs a product and a whole quantity greater than zero.',
          });
      merged.set(productId, (merged.get(productId) || 0) + quantity);
    }
    const cart = [...merged].map(([productId, quantity]) => ({ productId, quantity }));
    if (!(await ensureProductsExist(cart.map((item) => item.productId))))
      return res
        .status(400)
        .json({ success: false, message: 'One or more cart products no longer exist.' });
    const user = await User.findOneAndUpdate(
      { username: req.user.username },
      { $set: { cart } },
      { new: true },
    ).select('cart');
    return res.json({ success: true, cart: user.cart });
  } catch (error) {
    return next(error);
  }
};

const updateWishlist = async (req, res, next) => {
  try {
    const productIds = req.body?.productIds;
    if (!Array.isArray(productIds))
      return res
        .status(400)
        .json({ success: false, message: 'Wishlist product IDs must be an array.' });
    const wishlist = [...new Set(productIds.map((item) => item?.trim()).filter(Boolean))];
    if (!(await ensureProductsExist(wishlist)))
      return res
        .status(400)
        .json({ success: false, message: 'One or more wishlist products no longer exist.' });
    const user = await User.findOneAndUpdate(
      { username: req.user.username },
      { $set: { wishlist } },
      { new: true },
    ).select('wishlist');
    return res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    return next(error);
  }
};
module.exports = { createUser, registerCustomer, getShopState, updateCart, updateWishlist };
