const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { DateTime, Duration } = require("luxon");
const {
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
  isMonday,
} = require("date-fns");

const getAllBookingInfo = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;

    const user = await User.findOne({ _id: userID });

    const adminToken = req.cookies.admin;
    const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
    const isAdmin = decodedAdminToken.isAdmin;

    if (!isAdmin) {
      return res.status(400).send("Not An Admin");
    }

    const bookings = await Booking.find();

    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

async function calculateDistance(origin, destination) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origin
      )}&destinations=${encodeURIComponent(destination)}&key=${
        process.env.GOOGLE_API_KEY
      }`
    );

    if (response.data.status === "OK") {
      const distance = parseInt(
        response.data.rows[0].elements[0].distance.text
      );
      console.log("distance:" + distance);
      return distance;
    } else {
      throw new Error("Distance calculation failed");
    }
  } catch (error) {
    throw error;
  }
}

function isDateTimeInRange(dateTimeToCheck, rangeStart, rangeEnd) {
  return dateTimeToCheck >= rangeStart && dateTimeToCheck <= rangeEnd;
}

function isTimeInRange(timeToCheck, rangeStart, rangeEnd) {
  if (!(timeToCheck instanceof DateTime)) {
    throw new TypeError("timeToCheck must be a Date object");
  }
  rangeStart = new Date(rangeStart);
  rangeEnd = new Date(rangeEnd);
  const timeCheckJS = new Date(
    1970,
    0,
    1,
    timeToCheck.hour,
    timeToCheck.minute,
    0,
    0
  );
  const startTimeJS = new Date(
    1970,
    0,
    1,
    rangeStart.getHours(),
    rangeStart.getMinutes(),
    0,
    0
  );
  const endTimeJS = new Date(
    1970,
    0,
    1,
    rangeEnd.getHours(),
    rangeEnd.getMinutes(),
    0,
    0
  );
  const timeCheck = DateTime.fromJSDate(timeCheckJS);
  const startTime = DateTime.fromJSDate(startTimeJS);
  const endTime = DateTime.fromJSDate(endTimeJS);

  return timeCheck >= startTime && timeCheck <= endTime;
}

const busyEvents = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID; //auth complete

    const { customerLocation, expectedTimeToComplete, serviceName } = req.body;
    var validEmployees = [];
    var employees = await User.find({
      services: { $in: [serviceName] },
      isEmployee: true,
    }); // get all employees with isAdmin
    console.log("employees before distance calc: ", employees);
    await Promise.all(
      // check distance between all admin and location variable within the admins set range
      employees.map(async (employee) => {
        const distance = await calculateDistance(
          employee.location,
          customerLocation
        );
        if (distance <= employee.distance) {
          console.log("VALID EMPLOYEE");
          validEmployees.push(employee);
        }
      })
    );
    console.log("employees after distance calc: ", validEmployees);
    if (validEmployees.length === 0) {
      return res.send("There are no employees in your area.");
    }
    // Create a DateTime object for the current date and time
    const now = DateTime.local();

    // Calculate the next 15-minute increment
    const next15Minutes = Math.ceil(now.minute / 15) * 15;

    // Set the time to the next 15-minute increment and reset seconds and milliseconds
    let roundedTime = now.set({
      minute: next15Minutes,
      second: 0,
      millisecond: 0,
    });

    // If the next 15-minute increment goes into the next hour, increment the hour and reset the minutes
    if (next15Minutes >= 60) {
      roundedTime = roundedTime.plus({ hours: 1, minutes: -60 });
    }

    const startDate = roundedTime;

    // Calculate the end date as two months later
    const endDate = startDate.plus({ months: 1 });

    // Set the range end time to 8 PM
    var rangeEnd = startDate.set({ hour: 20, minute: 0 });

    const timeIncrement = Duration.fromObject({ minutes: 15 });
    let currentTime = startDate;

    let oldTime = currentTime;
    let busyTimeOpen = false;
    const busyTimes = [];
    var busyStartTime;
    var busyEndTime;

    // Make a single request to retrieve all bookings
    const allBookings = await Booking.find();
    console.log(allBookings);
    // Use Array.filter() to sort them into unClaimedBookings and claimedBookings
    const unClaimedBookings = allBookings.filter(
      (booking) => booking.employeeId === "none"
    );
    console.log(unClaimedBookings);
    // calculate busyTimes for all remaining employees
    while (currentTime < endDate) {
      if (currentTime > rangeEnd) {
        if (busyTimeOpen) {
          console.log("busyTime End: ", oldTime.toISO());
          busyEndTime = oldTime;
          busyTimes.push({
            start: busyStartTime.toISO(),
            end: busyEndTime.toISO(),
          });
          busyTimeOpen = false;
        }
        // currentTime > 8pm
        // Move to the next day at 8 AM
        currentTime = currentTime.plus({ days: 1 }).set({ hour: 8, minute: 0 });
        rangeEnd = rangeEnd.plus({ days: 1 });
        busyAllDay = true;
      }

      var numberOfEmployeesUnavalible = 0;
      await Promise.all(
        validEmployees.map(async (employee) => {
          employeeAvalible = true;
          const claimedBookings = allBookings.filter(
            (booking) => booking.employeeId === String(employee._id)
          );
          const jsEmployeeStartDate = new Date(
            employee.vacationTime?.startDate
          );
          const employeeStartDate = DateTime.fromJSDate(jsEmployeeStartDate);
          const jsEmployeeEndDate = new Date(employee.vacationTime?.endDate);
          const employeeEndDate = DateTime.fromJSDate(jsEmployeeEndDate);
          employeeEndDate.plus({ days: 1 });
          if (
            isDateTimeInRange(currentTime, employeeStartDate, employeeEndDate)
          ) {
            employeeAvalible = false;
          }
          let day = new Date(currentTime);
          if (
            (isSunday(day) &&
              !isTimeInRange(
                currentTime,
                employee.schedule.sunday.startTime,
                employee.schedule.sunday.endTime
              )) ||
            (isMonday(day) &&
              !isTimeInRange(
                currentTime,
                employee.schedule.monday.startTime,
                employee.schedule.monday.endTime
              )) ||
            (isTuesday(day) &&
              !isTimeInRange(
                currentTime,
                employee.schedule.tuesday.startTime,
                employee.schedule.tuesday.endTime
              )) ||
            (isWednesday(day) &&
              !isTimeInRange(
                currentTime,
                employee.schedule.wednesday.startTime,
                employee.schedule.wednesday.endTime
              )) ||
            (isThursday(day) &&
              !isTimeInRange(
                currentTime,
                employee.schedule.thursday.startTime,
                employee.schedule.thursday.endTime
              )) ||
            (isFriday(day) &&
              !isTimeInRange(
                currentTime,
                employee.schedule.friday.startTime,
                employee.schedule.friday.endTime
              )) ||
            (isSaturday(day) &&
              !isTimeInRange(
                currentTime,
                employee.schedule.saturday.startTime,
                employee.schedule.saturday.endTime
              ))
          ) {
            employeeAvalible = false;
            console.log("schedule");
          }

          if (employeeAvalible) {
            claimedBookings.forEach((booking) => {
              const date = new Date(booking._doc.date);
              const bookingDate = DateTime.fromJSDate(date);
              const rangeStart = bookingDate.minus({
                hours: expectedTimeToComplete,
              });
              const rangeEnd = bookingDate.plus({
                hours: booking._doc.expectedTimeToComplete,
              });
              if (isDateTimeInRange(currentTime, rangeStart, rangeEnd)) {
                employeeAvalible = false;
              }
            });
          }
          if (employeeAvalible) {
            for (let i = 0; i < unClaimedBookings.length; i++) {
              const booking = unClaimedBookings[i];
              // Now you can safely use includes
              if (
                booking._doc.possibleemployeeIds &&
                !booking._doc.possibleemployeeIds.includes(employee._id)
              ) {
                break; // employee can't claim booking
              }
              if (
                booking._doc.claimed !== true ||
                booking._doc.employeeId === employee._id
              ) {
                const date = new Date(booking._doc.date);
                const bookingDate = DateTime.fromJSDate(date);
                const rangeStart = bookingDate.minus({
                  hours: expectedTimeToComplete,
                });
                const rangeEnd = bookingDate.plus({
                  hours: booking._doc.expectedTimeToComplete,
                });
                unClaimedBookings[i] = {
                  ...booking,
                  employeeId: employee._id,
                  claimed: true,
                };
                if (isDateTimeInRange(currentTime, rangeStart, rangeEnd)) {
                  employeeAvalible = false;
                  console.log("employee busy");
                  break; // Exit the loop
                }
              }
            }
          }

          if (employeeAvalible === false) {
            numberOfEmployeesUnavalible++;
          }
        })
      );

      if (numberOfEmployeesUnavalible >= validEmployees.length) {
        if (!busyTimeOpen) {
          console.log("busyTime Start: ", currentTime.toISO());
          busyStartTime = currentTime;
          busyTimeOpen = true;
        }
      } else {
        if (busyTimeOpen) {
          console.log("busyTime End: ", oldTime.toISO());
          busyEndTime = oldTime;
          busyTimes.push({
            start: busyStartTime.toISO(),
            end: busyEndTime.toISO(),
          });
          busyTimeOpen = false;
        }
      }
      oldTime = currentTime;
      // increment 15 min
      currentTime = currentTime.plus(timeIncrement);
      numberOfEmployeesUnavalible = 0;
    }
    // calculations complete
    console.log(busyTimes);
    return res.json(busyTimes);
  } catch (error) {
    console.log("Error getting busy events: ", error);
  }
};

const getEmployeeBookings = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;
    const bookings = await Booking.find({
      possibleemployeeIds: { $in: [user_id] },
      employeeId: "none",
    }).sort({
      createdAt: -1,
    });

    const claimedBookings = await Booking.find({
      employeeId: user_id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({ bookings, claimedBookings });
  } catch (error) {
    return res.status(400).send(error);
  }
};

const getUserBookings = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;
    const bookings = await Booking.find({ userId: user_id }).sort({
      createdAt: -1,
    });

    res.status(200).json(bookings);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const createBooking = async (req, res) => {
  const maxUnClaimedBookings = 1;
  var unClaimedBookings = 0;
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const user = await User.findById(user_id);
    if (user.isEmployee) {
      return res.status(400).send("employees can't create bookings");
    }

    const pastBookings = await Booking.find({ userId: user_id });
    pastBookings.map((booking) => {
      if (booking.employeeId === "none") {
        unClaimedBookings++;
      }
    });
    if (unClaimedBookings >= maxUnClaimedBookings) {
      return res.status(400).send("too many unclaimed bookings");
    }
    const { cart, selectedDateTime } = req.body;
    let answeredQuestions = "";
    let summary = "";
    let description = "";
    let price = 0;
    let serviceTitles = [];
    var validEmployees = [];

    // MAKING EVENT DATA
    const serviceName = cart.services[0].title;
    console.log(serviceName);

    var employees = await User.find({
      services: { $in: [serviceName] },
      isEmployee: true,
    }); // get all employees with isAdmin
    console.log("employees before distance calc: ", employees);

    // check distance between all admin and location variable within the admins set range
    const promises = employees.map(async (employee) => {
      const distance = await calculateDistance(employee.location, cart.address);
      if (distance <= employee.distance) {
        validEmployees.push(employee);
        console.log(distance, " <= ", employee.distance);
        console.log("VALID EMPLOYEE");
      } else {
        console.log(distance, " >= ", employee.distance);
        console.log("INVALID EMPLOYEE");
      }
    });

    await Promise.all(promises);
    console.log("validEmployees: ", validEmployees);

    var possibleemployeeIds = [];
    validEmployees.map((employee) => {
      possibleemployeeIds.push(employee._id);
    });

    console.log("possibleemployeeIds: ", possibleemployeeIds);

    cart.services.forEach((service) => {
      answeredQuestions = "";
      service.answeredQuestions.forEach((answeredQuestion) => {
        answeredQuestions += `${answeredQuestion.question}: ${answeredQuestion.answer}\nCost Increase: $${answeredQuestion.costIncrease}\n`;
      });
      price += service.price;
      serviceTitles.push(service.title);
      description += `${service.title}: $${service.price}\n${answeredQuestions}\n`;
    });

    summary = serviceTitles.join(", ");
    summary += ` Price: $${price}`;

    let timeToComplete = 0; // calculate time to complete
    cart.services.forEach((service) => {
      timeToComplete += service.timeToComplete;
    });

    const services = [];
    cart.services.map((service) => {
      services.push(service.title);
    });

    // EVENT DATA COMPLETE

    // req.customerLocation = cart.address;
    // req.expectedTimeToComplete = cart.expectedTimeToComplete;
    // const busyEvents = await busyEvents(req, res);
    // // CHECK IF EMPLOYEES ARE BUSY
    // busyEvents.map((busyEvent) => {
    //   if (isDateTimeInRange(selectedDateTime, busyEvent.start, busyEvent.end)) {
    //     res.status(400).send("ERROR! EMPLOYEE BUSY");
    //   }
    // });

    try {
      const jsDate = new Date(selectedDateTime);
      const date = DateTime.fromJSDate(jsDate).toISO();
      console.log("selectedDateTime", date);
      const user = await User.findOne({ _id: user_id });
      const newBooking = new Booking({
        userId: user_id,
        possibleemployeeIds: possibleemployeeIds,
        name: user.displayName,
        email: user.email,
        services: cart.services,
        price: cart.price,
        date: date,
        expectedTimeToComplete: timeToComplete,
        summary,
        employeeEventId: "",
        description,
        phoneNumber: cart.phoneNumber,
        location: cart.address,
        cart,
        userEventId: "none",
        employeeEventId: "none",
        employeeId: "none",
      });
      newBooking.save();
      res.status(200).json(newBooking);
      console.log("Booking added to database: ", newBooking);
    } catch (error) {
      console.log("Error adding booking to database: ", error);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const setUserEventID = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;
    const { userEventId, bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId });
    booking.userEventId = userEventId;
    booking.save();
    return res.send("id added to booking");
  } catch (error) {
    console.log(error);
  }
};

const setEmployeeEventID = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const user = User.findOne({ _id: user_id });
    if (user.isEmployee === false) {
      return res.status(400).send("User is not an employee");
    }
    const { employeeEventId, bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId });
    booking.employeeEventId = employeeEventId;
    booking.save();
    return res.send("employeeEventId added to booking");
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error setting employee event id");
  }
};

const claimBooking = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const user = await User.findOne({ _id: user_id });
    if (user.isEmployee === false) {
      return res.status(400).send("User is not an employee");
    }
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId });

    if (booking.employeeId !== "none") {
      return res.status(400).send("Booking has already been claimed");
    }

    if (!user.claimedBookings) {
      user.claimedBookings = [];
    }
    user.claimedBookings.push(booking);
    user.save();
    booking.employeeId = user_id;
    booking.save();
    return res.send(user_id);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error setting employee event id");
  }
};

const unClaimBooking = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const user = await User.findOne({ _id: user_id });
    if (user.isEmployee === false) {
      return res.status(400).send("User is not an employee");
    }
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId });
    if (booking.employeeId !== user_id) {
      return res.status(400).send("This booking was not claimed by you");
    }
    user.claimedBookings &&
      user.claimedBookings.filter((b) => {
        b._id !== bookingId;
      });

    user.save();
    booking.employeeId = "none";
    booking.save();
    return res.send(user_id);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error Un-Claiming Booking");
  }
};

const deleteBooking = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const { booking } = req.body;
    console.log("booking: ", booking);

    const user = await User.findById(booking.userId);

    user.bookings &&
      user?.bookings.filter((b) => {
        b._id !== booking._id;
      });
    user.save();

    const employee = await User.findById(booking.employeeId);

    employee?.claimedBookings.filter((b) => {
      b._id !== booking._id;
    });
    employee.save();
    await Booking.findByIdAndDelete(booking._id);

    return res.status(200).send("booking deleted");
  } catch (error) {
    console.log(error);
    return res.status(400);
  }
};

module.exports = {
  getAllBookingInfo,
  deleteBooking,
  getEmployeeBookings,
  getUserBookings,
  createBooking,
  setEmployeeEventID,
  setUserEventID,
  busyEvents,
  unClaimBooking,
  claimBooking,
};
