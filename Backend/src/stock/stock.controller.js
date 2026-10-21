const Stock = require('./stock.model');
const Product = require('../products/product.model');
const getStock = async (req, res, next) => {
  try {
    const [stock, products] = await Promise.all([
      Stock.find().sort({ productId: 1 }).lean(),
      Product.find().lean(),
    ]);
    const names = Object.fromEntries(products.map((p) => [p.productId, p.name]));
    return res.json({
      success: true,
      stock: stock.map((item) => ({
        ...item,
        productName: names[item.productId] || item.productId,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const addStockQuantity = async (req, res, next) => {
  try {
    const quantity = Number(req.body?.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0)
      return res
        .status(400)
        .json({ success: false, message: 'Quantity must be a whole number greater than zero.' });
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const stock = await Stock.findOneAndUpdate(
      { productId: product.productId },
      { $inc: { quantity } },
      { upsert: true, new: true },
    );
    return res.json({ success: true, stock, message: 'Stock quantity added.' });
  } catch (error) {
    return next(error);
  }
};
module.exports = { getStock, addStockQuantity };
