const express = require('express')
const router = express.Router()
const { ensureAuth , ensureGuest} = require('../middleware/auth')
const bookingService = require('../service/bookingservice')
const Booking = require('../models/Booking')

// @desc    Add a new parking booking
// @route   GET /parking/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('parking/add')
})

// @desc    Book new parking
// @route   POST /parking 
router.post('/', ensureAuth, async (req, res) => {
  try {
    await bookingService.bookNewParking(req,res);
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Get all parking bookings made
// @route   GET /parking
router.get('/', ensureAuth, async (req, res) => {
  try {
    const parking = await Booking.find().populate('user')
      .sort({ createdAt: 'desc' })
      .lean()
    res.render('dashboard', {
      parking,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


// @desc    Show edit page
// @route   GET /parking/occupy/:id
router.get('/occupy/:id', ensureAuth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
    }).lean()

    if (!booking) {
      return res.render('error/404')
    }

    if (booking.user != req.user.id) {
      res.redirect('/parking')
    } else {
      res.render('parking/occupy', {
        booking,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Edit Parking to occupy
// @route   PUT /parking/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id).lean()

    if (!booking) {
      return res.render('error/404')
    }
    console.log(req.body);

    if (booking.user != req.user.id) {
      res.redirect('/parking')
    } else {
      booking = await Booking.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete Booking
// @route   DELETE /parking/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id).lean()

    if (!booking) {
      return res.render('error/404')
    }

    if (booking.user != req.user.id) {
      res.redirect('/parking')
    } else {
      await Booking.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    GET All Available Parking lots
// @route   GET /parking/available
router.get('/available', ensureGuest, async (req, res) => {
  try {
    const parkingInfo =  await  bookingService.getParkingLotInformation(req,res);
    const bookedParkingSpots =  await  bookingService.getBookedParkingSlots(req,res);
    const freeUnreservedParkingSlots = await  bookingService.getFreeReservedParkingSlots(parkingInfo.reservedParkingCapacity+1,bookedParkingSpots) 
    const availableReservedParkingSpots = await  bookingService.getFreeUnreservedParkingSlots(parkingInfo.reservedParkingCapacity+2,parkingInfo.totalParkingSlot+1,bookedParkingSpots) 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ "freeUnreservedParkingSlots": freeUnreservedParkingSlots,
                              "availableReservedParkingSpots": availableReservedParkingSpots}));
   
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    GET All Booked Parking lots
// @route   GET /parking/booked
router.get('/booked', ensureGuest, async (req, res) => {
  try {
    const parkingInfo =  await  bookingService.getParkingLotInformation(req,res);
    const bookedParkingSpots =  await  bookingService.getBookedParkingSlots(req,res);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ "bookedParkingSpots": bookedParkingSpots}));
   
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    GET All Booked Parking lots
// @route   GET /parking/users
router.get('/users', ensureGuest, async (req, res) => {
  try {
    const users =  await  bookingService.getUsers();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ "users": users}));
   
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})
module.exports = router
