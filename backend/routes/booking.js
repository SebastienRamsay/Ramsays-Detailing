const express = require("express");

const {
  deleteBooking,
  getAdminBookings,
  getEmployeeBookings,
  getUserBookings,
  setEmployeeEventID,
  unClaimBooking,
  claimBooking,
  setUserEventID,
  busyEvents,
  preCreateBooking,
  markBookingComplete,
} = require("../controllers/bookingController");

const router = express.Router();

// router.post("/", createBooking);

router.post("/pre", preCreateBooking);

router.patch("/setUserEventId", setUserEventID);

router.patch("/setEmployeeEventId", setEmployeeEventID);

router.patch("/claimBooking", claimBooking);

router.patch("/unClaimBooking", unClaimBooking);

router.post("/markBookingComplete", markBookingComplete);

router.get("/", getUserBookings);

router.get("/admin/info", getAdminBookings);

router.get("/employee", getEmployeeBookings);

router.post("/busyTimes", busyEvents);

module.exports = router;
