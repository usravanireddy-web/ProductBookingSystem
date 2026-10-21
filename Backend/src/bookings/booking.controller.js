const Booking = require('./booking.model');
const Product = require('../products/product.model');
const Stock = require('../stock/stock.model');
const History = require('../history/history.model');
const Counter = require('../config/counter.model');
const User = require('../users/user.model');
const { sendBookingConfirmation } = require('../config/mailer');
const toQuantity = (value) => (Number.isInteger(Number(value)) ? Number(value) : NaN);
const nextBookingId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: 'booking' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return `BOOK-${String(counter.sequence).padStart(3, '0')}`;
};
const assignMissingBookingIds = async () => {
  const legacyBookings = await Booking.find({
    $or: [{ bookingId: { $exists: false } }, { bookingId: null }],
  }).sort({ createdAt: 1 });
  for (const booking of legacyBookings) {
    booking.bookingId = await nextBookingId();
    await booking.save();
  }
};
const addHistory = (booking, event, status, quantityChanged, username) =>
  History.create({
    bookingId: booking._id,
    productId: booking.productId,
    event,
    status,
    requiredQuantity: booking.requiredQuantity,
    allocatedQuantity: booking.allocatedQuantity,
    quantityChanged,
    performedBy: username,
  });

const listBookings = async (req, res, next) => {
  try {
    await assignMissingBookingIds();
    return res.json({ success: true, bookings: await Booking.find().sort({ createdAt: -1 }) });
  } catch (error) {
    return next(error);
  }
};
const createBooking = async (req, res, next) => {
  try {
    const { productId } = req.body || {};
    const requiredQuantity = toQuantity(req.body?.requiredQuantity);
    if (!productId || !Number.isInteger(requiredQuantity) || requiredQuantity <= 0)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Select a product and enter a whole required quantity greater than zero.',
        });
    const product = await Product.findOne({ productId });
    if (!product)
      return res
        .status(400)
        .json({ success: false, message: 'The selected product does not exist.' });
    const booking = await Booking.create({
      bookingId: await nextBookingId(),
      productId,
      requiredQuantity,
      statusHistory: [{ status: 'Open' }],
    });
    await addHistory(booking, 'Created', 'Open', 0, req.user.username);
    const customer = await User.findOne({ username: req.user.username }).select(
      'fullName username',
    );
    sendBookingConfirmation({
      to: customer?.username,
      fullName: customer?.fullName,
      booking,
      product,
    }).catch((error) => console.error('Booking email could not be sent:', error.message));
    return res.status(201).json({ success: true, booking, emailQueued: true });
  } catch (error) {
    return next(error);
  }
};
const allocateBooking = async (req, res, next) => {
  try {
    const allocation = toQuantity(req.body?.quantity);
    if (!Number.isInteger(allocation) || allocation <= 0)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Allocation quantity must be a whole number greater than zero.',
        });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status !== 'Open')
      return res
        .status(409)
        .json({ success: false, message: 'Only open bookings can receive an allocation.' });
    if (booking.allocatedQuantity + allocation > booking.requiredQuantity)
      return res
        .status(400)
        .json({ success: false, message: 'Allocation cannot exceed the required quantity.' });
    booking.allocatedQuantity += allocation;
    if (booking.allocatedQuantity === booking.requiredQuantity) {
      booking.status = 'Allocated';
      booking.statusHistory.push({ status: 'Allocated' });
    }
    await booking.save();
    await addHistory(booking, 'Allocated', booking.status, allocation, req.user.username);
    return res.json({
      success: true,
      booking,
      message:
        booking.status === 'Allocated'
          ? 'Booking fully allocated.'
          : 'Allocation saved; allocate the remaining quantity to continue.',
    });
  } catch (error) {
    return next(error);
  }
};
const manufactureBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, status: 'Allocated', stockAdded: false },
      {
        $set: { status: 'Complete', stockAdded: true },
        $push: { statusHistory: { $each: [{ status: 'Manufactured' }, { status: 'Complete' }] } },
      },
      { new: true },
    );
    if (!booking)
      return res
        .status(409)
        .json({
          success: false,
          message: 'Only a fully allocated booking can be manufactured once.',
        });
    await Stock.findOneAndUpdate(
      { productId: booking.productId },
      { $inc: { quantity: booking.allocatedQuantity } },
      { upsert: true, new: true },
    );
    await Promise.all([
      addHistory(
        booking,
        'Manufactured',
        'Manufactured',
        booking.allocatedQuantity,
        req.user.username,
      ),
      addHistory(booking, 'Completed', 'Complete', 0, req.user.username),
    ]);
    return res.json({
      success: true,
      booking,
      message: 'Manufactured quantity added to stock and booking completed.',
    });
  } catch (error) {
    return next(error);
  }
};
module.exports = { listBookings, createBooking, allocateBooking, manufactureBooking };
