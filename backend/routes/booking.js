const express = require("express");

const {
  deleteBooking,
  getAllBookingInfo,
  getEmployeeBookings,
  getUserBookings,
  createBooking,
  setEmployeeEventID,
  unClaimBooking,
  claimBooking,
  setUserEventID,
  busyEvents,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", createBooking);

router.delete("/", deleteBooking);

router.patch("/setUserEventId", setUserEventID);

router.patch("/setEmployeeEventId", setEmployeeEventID);

router.patch("/claimBooking", claimBooking);

router.patch("/unClaimBooking", unClaimBooking);

router.get("/", getUserBookings);

router.get("/admin/info", getAllBookingInfo);

router.get("/employee", getEmployeeBookings);

router.post("/busyTimes", busyEvents);

module.exports = router;
