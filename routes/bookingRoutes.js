const express = require('express');
const { getAvailableSlots, createBooking } = require('../controllers/bookingController');

const router = express.Router();

router.get('/slots/:date', getAvailableSlots);
router.post('/book', createBooking);

module.exports = router;