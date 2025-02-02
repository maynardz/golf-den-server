const Sequelize = require('sequelize');
const sequelize = require('../config/db'); // Sequelize instance from db.js

// Import your models
const Booking = require('./Booking'); // Import Booking model

// Export all models
module.exports = {
  sequelize, // Sequelize instance
  Booking,   // Booking model
};
