const mongoose = require('mongoose');

var BookingSchema = new mongoose.Schema({
 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  bookingTime: {
    type: Date,
    default: Date.now,
    required: true
  },

  ExpiryTime: {
    type: Date,
    default: Date.now ,
    required: true
  },

  isReserved: {
    type: String,
    default: 'No',
    required: true
  },

  isParked: {
    type: String,
    default: 'No',
    required: true
  },

  parkingSpot: {
    type:String
  }

});

module.exports = mongoose.model('Booking', BookingSchema);

