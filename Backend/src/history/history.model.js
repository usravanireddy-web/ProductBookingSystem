const mongoose = require('mongoose');

// Immutable audit records make it possible to show the complete lifecycle of a booking.
const historySchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    productId: { type: String, required: true, index: true },
    event: {
      type: String,
      enum: ['Created', 'Allocated', 'Manufactured', 'Completed'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Allocated', 'Manufactured', 'Complete'],
      required: true,
    },
    requiredQuantity: { type: Number, required: true, min: 1 },
    allocatedQuantity: { type: Number, required: true, min: 0 },
    quantityChanged: { type: Number, default: 0, min: 0 },
    performedBy: { type: String, required: true },
  },
  { timestamps: true },
);

historySchema.index({ bookingId: 1, createdAt: 1 });
module.exports = mongoose.model('History', historySchema);
