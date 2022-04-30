const ParkingLot = require('../models/ParkingLot');

const initConfig = async () => {
  await ParkingLot.create({"totalParkingSlot": 120, "reservedParkingCapacity": 24, "notReservedParkingCapacity":96})
}

module.exports = initConfig
