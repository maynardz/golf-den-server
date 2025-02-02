const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import the Sequelize instance

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY, // Stores only YYYY-MM-DD
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME, // Stores HH:MM:SS
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  waiverSigned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  tableName: 'bookings', // Explicit table name
});

module.exports = Booking;