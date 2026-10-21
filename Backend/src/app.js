const express = require('express');
const cors = require('cors');

const authRoutes = require('./auth/auth.routes');
const productRoutes = require('./products/product.routes');
const bookingRoutes = require('./bookings/booking.routes');
const stockRoutes = require('./stock/stock.routes');
const historyRoutes = require('./history/history.routes');
const userRoutes = require('./users/user.routes');

const app = express();

// Development: Vite can move from 5173 to another localhost port when one is occupied.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS'));
    },
  }),
);
app.use(express.json());

app.get('/', (req, res) =>
  res.json({
    success: true,
    message: 'Product Booking API is running',
  }),
);

app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stock-inventory', stockRoutes);
app.use('/api/booking-history', historyRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err)
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body.',
    });
  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
  });
});

module.exports = app;
