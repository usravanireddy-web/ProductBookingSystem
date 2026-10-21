const Product = require('./product.model');
const Counter = require('../config/counter.model');
const Stock = require('../stock/stock.model');
const Booking = require('../bookings/booking.model');

const validateName = (name) => {
  const value = name?.trim();
  if (!value || value.length < 2 || value.length > 100) return null;
  return value;
};
const validateNonNegativeNumber = (value) =>
  Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
const validateQuantity = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0 ? Number(value) : null;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

const createProduct = async (req, res, next) => {
  try {
    const name = validateName(req.body?.name);
    const price = validateNonNegativeNumber(req.body?.price);
    const initialQuantity = validateQuantity(req.body?.initialQuantity ?? 0);
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: 'Product name must contain 2 to 100 characters.' });
    if (price === null)
      return res.status(400).json({ success: false, message: 'Price must be zero or greater.' });
    if (initialQuantity === null)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Initial quantity must be a whole number zero or greater.',
        });
    if (await Product.findOne({ name: new RegExp(`^${name}$`, 'i') }))
      return res
        .status(409)
        .json({ success: false, message: 'A product with this name already exists.' });
    let counter = await Counter.findOne({ name: 'product' });
    if (!counter) {
      const all = await Product.find({ productId: /^PROD-\d+$/ }).lean();
      const sequence = all.reduce((max, item) => Math.max(max, Number(item.productId.slice(5))), 0);
      await Counter.findOneAndUpdate(
        { name: 'product' },
        { $setOnInsert: { sequence } },
        { upsert: true },
      );
    }
    counter = await Counter.findOneAndUpdate(
      { name: 'product' },
      { $inc: { sequence: 1 } },
      { new: true },
    );
    const product = await Product.create({
      productId: `PROD-${String(counter.sequence).padStart(3, '0')}`,
      name,
      price,
    });
    await Stock.create({ productId: product.productId, quantity: initialQuantity });
    return res.status(201).json({ success: true, product });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const name = validateName(req.body?.name);
    const price = validateNonNegativeNumber(req.body?.price);
    const hasQuantity = Object.prototype.hasOwnProperty.call(req.body || {}, 'quantity');
    const quantity = hasQuantity ? validateQuantity(req.body.quantity) : null;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: 'Product name must contain 2 to 100 characters.' });
    if (price === null)
      return res.status(400).json({ success: false, message: 'Price must be zero or greater.' });
    if (hasQuantity && quantity === null)
      return res
        .status(400)
        .json({ success: false, message: 'Quantity must be a whole number zero or greater.' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const duplicate = await Product.exists({
      _id: { $ne: product._id },
      name: new RegExp(`^${escapeRegExp(name)}$`, 'i'),
    });
    if (duplicate)
      return res
        .status(409)
        .json({ success: false, message: 'A product with this name already exists.' });
    product.name = name;
    product.price = price;
    await product.save();
    const stock = hasQuantity
      ? await Stock.findOneAndUpdate(
          { productId: product.productId },
          { $set: { quantity } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        )
      : await Stock.findOne({ productId: product.productId });
    return res.json({ success: true, product, stock, message: 'Product updated.' });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (await Booking.exists({ productId: product.productId }))
      return res
        .status(409)
        .json({ success: false, message: 'This product has bookings and cannot be deleted.' });
    await Promise.all([
      Product.deleteOne({ _id: product._id }),
      Stock.deleteOne({ productId: product.productId }),
    ]);
    return res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
