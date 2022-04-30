const mongoose = require('mongoose');
const chalk = require('chalk');
require('../models/ParkingLot');
const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');
const User = require('../models/User');
const cron = require('node-cron');
const _ = require('lodash');

async function bookNewParking(req,res,next){
    req.body.user = req.user.id
    req.body.isParked = "No"
    
    //Assuming that the parking spots form 1 to reservedParkingCapacity are reserved 
    //Likewise the rest slots are unreserved
    //User books 15 mins prior
    try {
    const parkingInfo =  await getParkingLotInformation(req,res);
    const bookedParkingSpots =  await getBookedParkingSlots(req,res);
    const freeReservedParkingSpots = await getFreeReservedParkingSlots(parkingInfo.reservedParkingCapacity+1,bookedParkingSpots) 
    const freeUnReservedParkingSpots = await getFreeUnreservedParkingSlots(parkingInfo.reservedParkingCapacity+2,parkingInfo.totalParkingSlot+1,bookedParkingSpots) 

    var totalFreeSpots = freeUnReservedParkingSpots.length + freeReservedParkingSpots.length
   
    req.body.createdAt = Date.now()
    
    if(req.body.isReserved === "Yes" && Array.isArray(freeReservedParkingSpots) && freeReservedParkingSpots.length){
        req.body.parkingSpot = returnRandomElement(freeReservedParkingSpots)
        
        if(totalFreeSpots<(parkingInfo.totalParkingSlot+1)/2){
            req.body.bookingTime = req.body.createdAt + 1000*60*15
            req.body.ExpiryTime = req.body.createdAt + 1000*60*15
        }
        else{
        req.body.bookingTime = req.body.createdAt + 1000*60*15
        req.body.ExpiryTime = req.body.createdAt + 1000*60*30
        }
    }
    else if(req.body.isReserved === "Yes" &&  Array.isArray(freeUnReservedParkingSpots) && freeUnReservedParkingSpots.length){
        req.body.parkingSpot = returnRandomElement(freeUnReservedParkingSpots)
        if(totalFreeSpots<(parkingInfo.totalParkingSlot+1)/2){
            req.body.bookingTime = req.body.createdAt + 1000*60*15
            req.body.ExpiryTime = req.body.createdAt + 1000*60*15
           
        }
        else{
        req.body.bookingTime = req.body.createdAt + 1000*60*15
        req.body.ExpiryTime = req.body.createdAt + 1000*60*30
        }
    }
    else if(req.body.isReserved === "No" && Array.isArray(freeUnReservedParkingSpots) && freeUnReservedParkingSpots.length) {
        req.body.parkingSpot = returnRandomElement(freeUnReservedParkingSpots)
        if(totalFreeSpots<(parkingInfo.totalParkingSlot+1)/2){
            req.body.bookingTime = req.body.createdAt + 1000*60*15
            req.body.ExpiryTime = req.body.createdAt + 1000*60*15
        }
        else{
        req.body.bookingTime = req.body.createdAt + 1000*60*15
        req.body.ExpiryTime = req.body.createdAt + 1000*60*30
        }
    }

    await Booking.create(req.body)
    
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
    console.log("New Booking added successfully");
}

async function getParkingLotInformation(req, res, next) {
    const parkingInfo = await ParkingLot.findOne()
    return parkingInfo
}

async function getBookedParkingSlots(req, res, next) {
    const parkingSpots = await Booking.find()
    spotsTaken = []
    parkingSpots.forEach(function (parkingSpot) {
        spotsTaken.push(parkingSpot.parkingSpot)
    });

    return spotsTaken
}

async function getFreeReservedParkingSlots(totalParkingSlot,spotsTaken) {
    var totalSlots=[],b=totalParkingSlot;while(b--)totalSlots[b]=(b+1).toString();
    var freeSlots =  totalSlots.filter(x => spotsTaken.indexOf(x) === -1);
    return freeSlots;
}

async function getFreeUnreservedParkingSlots(reservedCapacity,totalParkingSlot,spotsTaken) {
    var totalSlots=[]
    for(let i= reservedCapacity;i<=totalParkingSlot;i++){
        totalSlots.push(i.toString());
    }

    var freeSlots =  totalSlots.filter(x => spotsTaken.indexOf(x) === -1);
    return freeSlots;
}


function returnRandomElement(items) {
    return items[Math.floor(Math.random()*items.length)]
}

async function deleteExpiredParkingSlots(req, res, next) {
    console.log("Cron jon running")
    const parkingSpots = await Booking.find()
    
    for (const parkingSpot of parkingSpots) {
    try{
        if(parkingSpot.ExpiryTime < Date.now() && parkingSpot.isParked==="No"){
            console.log(parkingSpot._id)
            await Booking.deleteOne({ _id: parkingSpot._id}) //Expired Booking will be deleted those are not parked
        }
    } catch(err){
    res.render('error/500');
    };
    }
    console.log("Expired Bookings deleted successfully")


}

async function getUsers() {
    const users = await User.find();
    var userList = []
    const allowed = ['_id', 'displayName','createdAt'];
    for (const user of users) {
    userList.push(_.pick(user, allowed));
    }
    return userList
}


//running cron task every minute to free unoccupied spots
cron.schedule("* * * * *", async () => deleteExpiredParkingSlots());

  
module.exports = {bookNewParking,getUsers,getBookedParkingSlots,getParkingLotInformation,getFreeUnreservedParkingSlots,getFreeReservedParkingSlots};