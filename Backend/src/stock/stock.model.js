const mongoose = require('mongoose');
const stockSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    quantity: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
module.exports = mongoose.model('Stock', stockSchema);
