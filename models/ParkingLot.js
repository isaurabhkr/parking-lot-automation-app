const mongoose = require('mongoose');

var ParkingLotSchema = new mongoose.Schema({
 
  totalParkingSlot: { 
    type: Number,
    default: 120,
  },
  reservedParkingCapacity: { 
    type: Number,
    default: 24,
  },
  notReservedParkingCapacity: { 
    type: Number,
    default: 96,
  },

});

module.exports = mongoose.model('ParkingLot', ParkingLotSchema);

