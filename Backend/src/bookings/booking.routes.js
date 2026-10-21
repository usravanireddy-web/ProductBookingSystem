const router = require('express').Router();
const { requireAuth } = require('../auth/auth.middleware');
const {
  listBookings,
  createBooking,
  allocateBooking,
  manufactureBooking,
} = require('./booking.controller');
router.use(requireAuth);
router.route('/').get(listBookings).post(createBooking);
router.post('/:id/allocate', allocateBooking);
router.post('/:id/manufacture', manufactureBooking);
module.exports = router;
