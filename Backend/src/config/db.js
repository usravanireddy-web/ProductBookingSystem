const mongoose = require('mongoose');
const Product = require('../products/product.model');
const Stock = require('../stock/stock.model');
const Booking = require('../bookings/booking.model');
const Counter = require('./counter.model');
const User = require('../users/user.model');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (!(await User.exists({ username: adminUsername }))) {
    await User.create({
      username: adminUsername,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: 'admin',
    });
  }
  const products = [
    { productId: 'PROD-001', name: 'Product A' },
    { productId: 'PROD-002', name: 'Product B' },
  ];
  for (const product of products) {
    await Product.updateOne(
      { productId: product.productId },
      { $setOnInsert: product },
      { upsert: true },
    );
    await Stock.updateOne(
      { productId: product.productId },
      { $setOnInsert: { productId: product.productId, quantity: 0 } },
      { upsert: true },
    );
  }
  // Add readable IDs to bookings created before BOOK-001 support was added.
  const legacyBookings = await Booking.find({
    $or: [{ bookingId: { $exists: false } }, { bookingId: null }],
  }).sort({ createdAt: 1 });
  for (const booking of legacyBookings) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'booking' },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true },
    );
    booking.bookingId = `BOOK-${String(counter.sequence).padStart(3, '0')}`;
    await booking.save();
  }
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required. Add it to Backend/.env.');
  await mongoose.connect(process.env.MONGO_URI);
  await seedData();
  console.log('MongoDB connected and sample data is ready');
};

module.exports = connectDB;
