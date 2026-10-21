const History = require('./history.model');
const Product = require('../products/product.model');
const getHistory = async (req, res, next) => {
  try {
    const filter = req.query.bookingId ? { bookingId: req.query.bookingId } : {};
    const [history, products] = await Promise.all([
      History.find(filter).sort({ createdAt: -1 }).lean(),
      Product.find().lean(),
    ]);
    const names = Object.fromEntries(products.map((p) => [p.productId, p.name]));
    return res.json({
      success: true,
      history: history.map((entry) => ({
        ...entry,
        productName: names[entry.productId] || entry.productId,
      })),
    });
  } catch (error) {
    return next(error);
  }
};
module.exports = { getHistory };
