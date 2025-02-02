const Booking = require('../models/Booking'); // Import the Booking model
const moment = require('moment');

// Define operating hours
const OPERATING_HOURS = {
    Friday: { start: '17:00', end: '21:00' }, // 5:00 PM - 9:00 PM
    Saturday: { start: '08:00', end: '18:00' }, // 8:00 AM - 6:00 PM
    Sunday: { start: '08:00', end: '18:00' }, // 8:00 AM - 6:00 PM
};

// Generate all possible time slots in 15-minute increments
const generateSlots = (day) => {
    if (!OPERATING_HOURS[day]) return [];

    const startTime = new Date(`2023-01-01T${OPERATING_HOURS[day].start}:00`);
    const endTime = new Date(`2023-01-01T${OPERATING_HOURS[day].end}:00`);
    const slots = [];

    let current = new Date(startTime);

    while (current < endTime) {
        slots.push(current.toTimeString().substring(0, 5)); // "HH:MM" format
        current.setMinutes(current.getMinutes() + 15);
    }

    return slots;
};

// Update the date format
const formatDate = (date) => {
    const moment = require('moment');
    return moment(date).format('YYYY-MM-DD');  // Ensure the date is in the correct format
};

// Get available slots while considering existing bookings and buffer time
const getAvailableSlots = async (req, res) => {
    let { date } = req.params;
    date = date.trim(); // Ensure no leading/trailing spaces

    // Ensure correct day calculation using UTC
    const day = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    console.log(`Parsed Day for ${date}:`, day); // Debugging log

    const allSlots = generateSlots(day);
    if (!allSlots.length) return res.json({ date, availableSlots: [] });

    try {
        const bookings = await Booking.findAll({ where: { date } });

        console.log(`Bookings on ${date}:`, bookings.map(b => `${b.time} for ${b.duration} minutes`));

        let bookedSlots = new Set();
        bookings.forEach((booking) => {
            let [hours, minutes] = booking.time.split(':'); // Ensure correct parsing
            let startTime = new Date(2023, 0, 1, parseInt(hours), parseInt(minutes)); // Use explicit Date constructor
            let endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + booking.duration);
            let totalEndTime = new Date(endTime);
            totalEndTime.setMinutes(totalEndTime.getMinutes() + 15); // Adding buffer time

            console.log(`Blocking from ${startTime.toTimeString().substring(0, 5)} to ${totalEndTime.toTimeString().substring(0, 5)}`);

            while (startTime < totalEndTime) {
                bookedSlots.add(startTime.toTimeString().substring(0, 5));
                startTime.setMinutes(startTime.getMinutes() + 15);
            }
        });

        // Filter out booked slots
        const availableSlots = allSlots.filter((slot) => !bookedSlots.has(slot));

        console.log(`Available Slots for ${date}:`, availableSlots);

        res.json({ date, availableSlots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a booking
const createBooking = async (req, res) => {
    const { date, time, duration, firstName, lastName, phone, email } = req.body;
    const io = req.app.get('socketio');
    const formattedDate = formatDate(date);  

    const dayOfWeek = moment(formattedDate).format('dddd'); // Get day name

    // Prevent bookings on Monday - Thursday
    if (['Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(dayOfWeek)) {
        return res.status(400).json({ message: 'Bookings are only allowed from Friday to Sunday.' });
    }

    try {
        const existingBooking = await Booking.findOne({
            where: { date: formattedDate, time },
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Time slot already booked' });
        }

        const newBooking = await Booking.create({
            date: formattedDate,
            time,
            duration,
            firstName,
            lastName,
            phone,
            email,
            waiverSigned: false,
        });

        io.emit('bookingUpdated', newBooking);
        res.json({ message: 'Booking created successfully', booking: newBooking });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAvailableSlots, createBooking };
