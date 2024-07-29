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
const { getCoordinatesFromAddress } = require("../utils/locationCache");
const maxUnClaimedBookings = 1;
const maxUnPaidBookings = 1;

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}
// takes two sets of coordinates and returns the distance
// between them in kilometers using the Haversine formula
function calculateDistance(coord1, coord2) {
  const earthRadiusKm = 6371; // Radius of the Earth in kilometers

  const dLat = degreesToRadians(coord2.latitude - coord1.latitude);
  const dLon = degreesToRadians(coord2.longitude - coord1.longitude);

  const lat1 = degreesToRadians(coord1.latitude);
  const lat2 = degreesToRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadiusKm * c;

  return distance;
}

function isDateTimeInRange(dateTimeToCheck, rangeStart, rangeEnd) {
  return dateTimeToCheck >= rangeStart && dateTimeToCheck <= rangeEnd;
}
function isDateTimeRangeWithinAnother(start1, end1, start2, end2) {
  return start1 >= start2 && end1 <= end2;
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

async function getBusyEvents(req) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return {
        complete: false,
        message: "Not Logged In",
      };
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID; //auth complete

    const { customerLocation, expectedTimeToComplete, serviceNames } = req.body;
    if (!serviceNames || serviceNames.length === 0) {
      return {
        complete: false,
        message: "No Service Names Provided",
      };
    }
    const customerCoords = await getCoordinatesFromAddress(customerLocation);
    var validEmployees = [];
    var employees = await User.find({
      services: { $in: serviceNames },
      isEmployee: true,
    });
    // console.log("employees before distance calc: ", employees);
    await Promise.all(
      // check distance between all employee's and the customers location
      employees.map(async (employee) => {
        const decodedEmployeeCoords = jwt.verify(
          employee.coords,
          process.env.SECRET
        );
        const employeeCoords = {
          longitude: decodedEmployeeCoords.lon,
          latitude: decodedEmployeeCoords.lat,
        };
        // console.log(employeeCoords);
        const distance = await calculateDistance(
          employeeCoords,
          customerCoords
        );
        if (distance <= employee.distance) {
          // within the employees set range
          console.log("VALID EMPLOYEE");
          validEmployees.push(employee);
        }
      })
    );
    // console.log("employees after distance calc: ", validEmployees);
    if (validEmployees.length === 0) {
      return {
        complete: false,
        message: "There are no employees in your area.",
      };
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
    const endDate = startDate.plus({ months: 2 });
    // Set the range end time to 8 PM
    var rangeEnd = startDate.set({ hour: 20, minute: 0 });
    const timeIncrement = Duration.fromObject({ minutes: 15 });
    let currentTime = startDate;
    let oldTime = currentTime;
    let busyTimeOpen = false;
    const busyTimes = [];
    var busyStartTime;
    var busyEndTime;

    // Find all bookings within the next 2 months
    const allBookings = await Booking.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    console.log(allBookings);
    // Use Array.filter() to sort them into unClaimedBookings and claimedBookings
    const unClaimedBookings = allBookings.filter(
      (booking) =>
        booking.employeeId === "none" && booking.status === "Un-Claimed"
    );

    // calculate busyTimes for all remaining employees
    while (currentTime < endDate) {
      // 15 inc for 2 months
      if (currentTime > rangeEnd) {
        // 8pm every day
        if (busyTimeOpen) {
          // end any open busy times
          // console.log("busyTime End: ", oldTime.toISO());
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
            // console.log("schedule");
          }

          if (employeeAvalible) {
            claimedBookings.forEach((booking) => {
              const date = new Date(booking._doc.date);
              const bookingDate = DateTime.fromJSDate(date);
              const rangeStart = bookingDate.minus({
                hours: expectedTimeToComplete + 1,
              });
              const rangeEnd = bookingDate.plus({
                hours: booking._doc.expectedTimeToComplete + 1,
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
                  hours: expectedTimeToComplete + 1,
                });
                const rangeEnd = bookingDate.plus({
                  hours: booking._doc.expectedTimeToComplete + 1,
                });
                unClaimedBookings[i] = {
                  ...booking,
                  employeeId: employee._id,
                  claimed: true,
                };
                if (isDateTimeInRange(currentTime, rangeStart, rangeEnd)) {
                  employeeAvalible = false;
                  // console.log("employee busy");
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
          // console.log("busyTime Start: ", currentTime.toISO());
          busyStartTime = currentTime;
          busyTimeOpen = true;
        }
      } else {
        if (busyTimeOpen) {
          // console.log("busyTime End: ", oldTime.toISO());
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
    // console.log(busyTimes);
    return { complete: true, busyTimes: busyTimes };
  } catch (error) {
    console.log("Error getting busy events: ", error);
    return { complete: false, message: "Error getting busy events: " + error };
  }
}

const busyEvents = async (req, res) => {
  const response = await getBusyEvents(req);
  if (response.complete) {
    return res.status(200).send(response.busyTimes);
  } else {
    return res.status(400).send(response.message);
  }
};

const preCreateBooking = async (req, res) => {
  var unClaimedBookings = 0;
  var numberOfUnPaidBookings = 0;
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const user = await User.findById(user_id);
    if (user.isEmployee) {
      return res.status(400).send("Employees can't create bookings.");
    }

    const pastBookings = await Booking.find({ userId: user_id });
    pastBookings.map((booking) => {
      if (booking.employeeId === "none" && booking.status === "Un-Claimed") {
        unClaimedBookings++;
      }
      if (booking.status === "Un-Paid") {
        numberOfUnPaidBookings++;
      }
      return booking;
    });
    if (unClaimedBookings >= maxUnClaimedBookings) {
      return res.status(400).send("Too many unclaimed bookings.");
    }
    if (numberOfUnPaidBookings >= maxUnPaidBookings) {
      return res
        .status(400)
        .send(
          "Too Many Un-Paid Bookings. Please retry payment or cancel the un-paid booking."
        );
    }
    const { cart } = req.body;
    let timeToComplete = 0; // calculate time to complete
    cart.services.forEach((service) => {
      timeToComplete += service.timeToComplete;
    });

    req.body.customerLocation = cart.address;
    req.body.expectedTimeToComplete = timeToComplete;
    req.body.serviceNames = cart.services.map((service) => service.title);

    const busyTimesReponse = await getBusyEvents(req);
    if (!busyTimesReponse.complete) {
      return res
        .status(400)
        .send("busyTimes Error: " + busyTimesReponse.message);
    }
    const busyTimes = busyTimesReponse.busyTimes;
    console.log("CREATE BOOKING BUSYTIMES: " + busyTimes);
    const jsDate = new Date(cart.selectedDateTime);
    const start = DateTime.fromJSDate(jsDate).toISO();
    const end = DateTime.fromJSDate(jsDate)
      .plus({ hours: timeToComplete })
      .toISO();
    busyTimes.map((time) => {
      if (isDateTimeRangeWithinAnother(start, end, time.start, time.end)) {
        res.status(400).send("Please select a differnt time");
      }
    });

    const customerCoords = await getCoordinatesFromAddress(cart.address);
    var validEmployees = [];

    const serviceNames = cart.services.map((service) => service.title);

    // MAKING EVENT DATA
    const employees = await User.find({
      isEmployee: true,
      onboardingComplete: true,
      services: { $all: serviceNames },
    });
    console.log(serviceNames);
    console.log(employees);
    // check distance between all employees location and customerCoords variable within the employee set range
    const promises = employees.map(async (employee) => {
      const employeeLocation = jwt.verify(
        employee.location,
        process.env.SECRET
      ).location;
      // console.log(JSON.stringify(employeeLocation));
      const employeeCoords = await getCoordinatesFromAddress(employeeLocation);
      const distance = await calculateDistance(employeeCoords, customerCoords);
      if (distance <= employee.distance) {
        validEmployees.push(employee);
        console.log(distance, " <= ", employee.distance);
        console.log("VALID EMPLOYEE: " + employee);
      } else {
        console.log(distance, " >= ", employee.distance);
        console.log("INVALID EMPLOYEE");
      }
    });

    await Promise.all(promises);
    console.log(validEmployees);
    if (!validEmployees | (validEmployees.length <= 0)) {
      return res.status(400).send("No available employees in you area.");
    }
    return res.status(200).send("Pre-Booking Successful.");
  } catch (error) {
    console.log("pre-booking error: ", error);
    return res.status(400).send("Something went wrong.");
  }
};

const createBooking = async (req, res) => {
  var unClaimedBookings = 0;
  try {
    const token = req.cookies.token;

    if (!token) {
      return { created: false, message: "Not Logged In" };
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const user = await User.findById(user_id);
    if (user.isEmployee) {
      return { created: false, message: "employees can't create bookings" };
    }

    const pastBookings = await Booking.find({ userId: user_id });
    pastBookings.map((booking) => {
      if (booking.employeeId === "none") {
        unClaimedBookings++;
      }
    });
    if (unClaimedBookings >= maxUnClaimedBookings) {
      try {
        const adminToken = req.cookies.admin;
        const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
        const isAdmin = decodedAdminToken.isAdmin;

        if (!isAdmin) {
          return { created: false, message: "too many unclaimed bookings" };
        }
      } catch (error) {
        return { created: false, message: "too many unclaimed bookings" };
      }
    }
    const { cart } = req.body;
    const customerCoords = await getCoordinatesFromAddress(cart.address);
    let answeredQuestions = "";
    let summary = "";
    let description = "";
    let price = 0;
    let serviceTitles = [];
    var validEmployees = [];

    // MAKING EVENT DATA
    const serviceNames = cart.services.map((service) => service.title);

    const employees = await User.find({
      services: { $all: serviceNames },
      isEmployee: true,
    }); // get employees with all serviceNames
    console.log("employees before distance calc: ", employees);

    // check distance between all employees location and customerCoords variable within the employee set range
    const promises = employees.map(async (employee) => {
      const employeeLocation = jwt.verify(
        employee.location,
        process.env.SECRET
      ).location;
      const employeeCoords = await getCoordinatesFromAddress(employeeLocation);
      const distance = await calculateDistance(employeeCoords, customerCoords);
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
    //     return res.status(400).send("ERROR! EMPLOYEE BUSY");
    //   }
    // });

    try {
      const jsDate = new Date(cart.selectedDateTime);
      const date = DateTime.fromJSDate(jsDate).toISO();
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
        status: "Un-Paid",
      });
      newBooking.save();
      console.log("Booking added to database: ", newBooking);
      return { created: true, newBooking };
    } catch (error) {
      console.log("Error adding booking to database: ", error);
    }
  } catch (error) {
    console.log("Error creating booking: ", error.message);
    return { created: false, message: error.message };
  }
};

const getAdminBookings = async (req, res) => {
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

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "Confirmed"
    );
    const completeBookings = bookings.filter(
      (booking) => booking.status === "Complete"
    );
    const claimedBookings = bookings.filter(
      (booking) =>
        booking.employeeId !== "none" &&
        booking.status !== "Complete" &&
        booking.status !== "Confirmed"
    );
    const unClaimedBookings = bookings.filter(
      (booking) => booking.employeeId === "none"
    );

    return res.status(200).json({
      unClaimedBookings,
      claimedBookings,
      completeBookings,
      confirmedBookings,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getEmployeeBookings = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;
    const bookings = await Booking.find({
      possibleemployeeIds: { $in: [user_id] },
    }).sort({
      createdAt: -1,
    });

    const unClaimedBookings = bookings.filter(
      (booking) =>
        booking.employeeId === "none" &&
        booking.status === "Un-Claimed" &&
        booking.payment_intent
    );
    const confirmedBookings = bookings.filter(
      (booking) =>
        booking.status === "Confirmed" && booking.employeeId === user_id
    );
    const completeBookings = bookings.filter(
      (booking) =>
        booking.status === "Complete" && booking.employeeId === user_id
    );
    const claimedBookings = bookings.filter(
      (booking) =>
        booking.employeeId === user_id &&
        booking.status !== "Complete" &&
        booking.status !== "Confirmed"
    );
    console.log(unClaimedBookings);
    return res.status(200).json({
      unClaimedBookings,
      confirmedBookings,
      claimedBookings,
      completeBookings,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

const getUserBookings = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;
    const bookings = await Booking.find({ userId: user_id }).sort({
      createdAt: -1,
    });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const setUserEventID = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).send("Not Logged In");
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
      return res.status(400).send("Not Logged In");
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
      return res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const user = await User.findOne({ _id: user_id });
    if (!user.isEmployee) {
      try {
        const adminToken = req.cookies.admin;
        const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
        isAdmin = decodedAdminToken.isAdmin;

        if (!isAdmin) {
          return res.status(400).send("Not An Admin");
        }
      } catch (error) {
        return res.status(400).send("User is not an employee");
      }
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
    booking.status = "Claimed";
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
    var isAdmin;
    if (!token) {
      return res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const user = await User.findOne({ _id: user_id });

    if (user.isEmployee === false) {
      try {
        const adminToken = req.cookies.admin;
        const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
        isAdmin = decodedAdminToken.isAdmin;

        if (!isAdmin) {
          return res.status(400).send("Not An Admin");
        }
      } catch (error) {
        return res.status(400).send("User is not an employee");
      }
    }
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId });
    if (booking.employeeId !== user_id && !isAdmin) {
      return res.status(400).send("This booking was not claimed by you");
    }
    user.claimedBookings &&
      user.claimedBookings.filter((b) => {
        b._id !== bookingId;
      });

    user.save();
    booking.employeeId = "none";
    booking.status = "Un-Claimed";
    booking.save();
    return res.send(user_id);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error Un-Claiming Booking");
  }
};

const markBookingPaid = async (req, res) => {
  try {
    const { bookingId, payment_intent } = req.body;
    console.log(payment_intent, bookingId);
    const booking = await Booking.findOne({ _id: bookingId });
    const encoded_payment_intent = jwt.sign(payment_intent, process.env.SECRET);
    booking.payment_intent = encoded_payment_intent;
    booking.status = "Un-Claimed";
    booking.save();
    return { complete: true };
  } catch (error) {
    console.log(error);
    return { complete: false, message: "Error Marking Booking Paid" };
  }
};

const markBookingComplete = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ _id: bookingId });
    booking.status = "Complete";
    booking.save();
    return res.status(200).send("Booking Marked Complete");
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error Marking Booking Complete");
  }
};

const deleteBooking = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return { complete: false, message: "Not Logged In" };
    }
    const userId = jwt.verify(token, process.env.SECRET).userID;

    const { _id } = req.body;

    const user = await User.findById(userId);
    const booking = await Booking.findById(_id);

    if (booking.userId !== userId) {
      try {
        const adminToken = req.cookies.admin;
        const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
        isAdmin = decodedAdminToken.isAdmin;

        if (!isAdmin) {
          return { complete: false, message: "Not An Admin" };
        }
      } catch (error) {
        return { complete: false, message: "You don't' own this booking" };
      }
    }

    user.bookings &&
      user?.bookings.filter((b) => {
        b._id !== _id;
      });
    user.save();

    if (booking.employeeId & (booking.employeeId !== "none")) {
      const employee = await User.findById(booking.employeeId);

      employee?.claimedBookings?.filter((b) => {
        b._id !== _id;
      });
      employee.save();
    }

    await Booking.findByIdAndDelete(_id);

    return { complete: true };
  } catch (error) {
    console.log(error);
    return { complete: false, message: error };
  }
};

const reScheduleBooking = async (req, res) => {
  try {
    const token = req.cookies.token;
    const { bookingId, dateTime } = req.body;
    if (!token) {
      return { complete: false, message: "Not Logged In" };
    }
    const userId = jwt.verify(token, process.env.SECRET).userID;
    const user = User.findById(userId);
    const booking = Booking.findById(bookingId);

    if (user._id !== booking.userId) {
      return res.status(400).send("You don't own this booking");
    }

    req.body.customerLocation = booking.location;
    req.body.expectedTimeToComplete = booking.expectedTimeToComplete;
    req.body.serviceNames = booking.cart.services.map(
      (service) => service.title
    );

    const busyTimes = getBusyEvents(req, res);
    const jsDate = new Date(dateTime);
    const date = DateTime.fromJSDate(jsDate).toISO();
    const end = DateTime.fromJSDate(jsDate)
      .plus({ hours: timeToComplete })
      .toISO();
    busyTimes.map((time) => {
      if (isDateTimeRangeWithinAnother(date, end, time.start, time.end)) {
        res.status(400).send("Please select a differnt time");
      }
    });

    booking.date = date;

    // Check if employee is busy during new dateTime
    if (booking.employeeId) {
      // if booking claimed
      let hasOverlap = false;
      const employeesClaimedBookings =
        (await Booking.find({ employeeId: booking.employeeId })) || [];

      employeesClaimedBookings.forEach((claimedBooking) => {
        if (
          doEventsOverlap(
            dateTime,
            booking.timeToComplete,
            claimedBooking.date,
            claimedBooking.timeToComplete
          )
        ) {
          hasOverlap = true;
        }
        return claimedBooking;
      });
      if (hasOverlap) {
        booking.employeeId = ""; //unclaim booking as current emplyee is busy on new day.
      }
    }
    booking.save();
    return res.status(200).send("Booking Re-Scheduled");
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

// Function to check if two events overlap
function doEventsOverlap(
  event1StartDate,
  event1TimeToComplete,
  event2StartDate,
  event2TimeToComplete
) {
  const event1End = event1StartDate.plus({ hours: event1TimeToComplete });
  const event2End = event2StartDate.plus({ hours: event2TimeToComplete });

  return (
    (event1StartDate <= event2StartDate && event1End >= event2StartDate) ||
    (event2StartDate <= event1StartDate && event2End >= event1StartDate)
  );
}

module.exports = {
  getAdminBookings,
  deleteBooking,
  getEmployeeBookings,
  getUserBookings,
  preCreateBooking,
  setEmployeeEventID,
  setUserEventID,
  busyEvents,
  unClaimBooking,
  claimBooking,
  markBookingPaid,
  createBooking,
  markBookingComplete,
  reScheduleBooking,
};
