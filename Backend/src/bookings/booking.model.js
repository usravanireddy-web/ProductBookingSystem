const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true },
    requiredQuantity: { type: Number, required: true, min: 1 },
    allocatedQuantity: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Open', 'Allocated', 'Manufactured', 'Complete'],
      default: 'Open',
    },
    stockAdded: { type: Boolean, default: false },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true },
);
module.exports = mongoose.model('Booking', bookingSchema);
