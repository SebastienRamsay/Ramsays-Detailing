const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { DateTime } = require("luxon");
const { getCoordinatesFromAddress } = require("../utils/locationCache");

const getUserInfo = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const user = await User.findOne({ _id: userID });

    const displayName = user.displayName;
    const profilePicture = user.profilePicture;

    res.status(200).json({ displayName, profilePicture });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const requestUpdateEmployeeInfo = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const user = await User.findOne({ _id: userID });

    if (!user.isEmployee) {
      return res.status(400).send("Not An Employee");
    }

    const { location, services, distance } = req.body;

    if (location) {
      const signedLocation = jwt.sign(
        {
          location,
        },
        process.env.SECRET
      );
      user.requestedLocation = signedLocation;
    }
    if (services) {
      user.requestedServices = services;
    }
    if (distance) {
      user.requestedDistance = distance;
    }

    user.save();

    return res.status(200).json("Employee Info Updated");
  } catch (error) {
    return res.status(400).json("Error Updating Data");
  }
};

const updateEmployeeInfo = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const admin = await User.findOne({ _id: userID });

    const adminToken = req.cookies.admin;
    const decodedAdminToken = jwt.verify(adminToken, process.env.SECRET);
    const isAdmin = decodedAdminToken.isAdmin;

    if (!isAdmin) {
      return res.status(400).send("Not An Admin");
    }

    const { location, services, distance, userId } = req.body;
    const user = await User.findOne({ _id: userId });

    if (location) {
      const decodedLocation = jwt.verify(
        user.requestedLocation,
        process.env.SECRET
      ).location;
      const coords = getCoordinatesFromAddress(decodedLocation);
      const signedCoords = jwt.sign(
        {
          coords,
        },
        process.env.SECRET
      );
      user.location = signedCoords;
    }

    if (services) {
      user.services = user.requestedServices;
    }

    if (distance) {
      user.distance = user.requestedDistance;
    }

    user.requestedDistance = "";
    user.requestedLocation = "";
    user.requestedServices = "";

    user.save();

    return res.status(200).json("Employee Info Updated");
  } catch (error) {
    return res.status(400).json("Error Updating Data");
  }
};

const updateEmployeeSchedule = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;

    const { schedule, vacationTime } = req.body;

    // Validate incoming data
    if (!schedule || !vacationTime) {
      return res.status(400).json("Invalid data format");
    }

    const user = await User.findOne({ _id: userID });

    if (!user) {
      return res.status(404).json("User not found");
    }

    // A function to convert strings to luxon ISO strings
    const convertStringToISO = (date) =>
      date ? DateTime.fromISO(date).toISO() : "";

    // Convert vacationTime dates to ISO
    vacationTime.startDate = convertStringToISO(vacationTime.startDate);
    vacationTime.endDate = convertStringToISO(vacationTime.endDate);

    // Convert schedule times to ISO
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    daysOfWeek.forEach((day) => {
      schedule[day].startTime = convertStringToISO(schedule[day].startTime);
      schedule[day].endTime = convertStringToISO(schedule[day].endTime);
    });

    user.vacationTime = vacationTime;
    user.schedule = schedule;

    await user.save();

    // Log successful update
    console.log("Employee info updated for userID:", userID);

    return res.status(200).json("Employee Info Updated");
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error updating employee info:", error);

    return res.status(500).json("Error Updating Data");
  }
};

const updateEmplyeeStatus = async (req, res) => {
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

    const { isEmployee, employeeID } = req.body.data;
    console.log(isEmployee, employeeID);

    const employee = await User.findOne({ _id: employeeID });

    employee.isEmployee = isEmployee;

    if (isEmployee) {
      const defaultStartTime = new Date();
      defaultStartTime.setHours(8, 0, 0, 0);
      const defaultEndTime = new Date();
      defaultEndTime.setHours(15, 0, 0, 0);
      employee.schedule.sunday.startTime = defaultStartTime;
      employee.schedule.sunday.endTime = defaultEndTime;
      employee.schedule.monday.startTime = defaultStartTime;
      employee.schedule.monday.endTime = defaultEndTime;
      employee.schedule.tuesday.startTime = defaultStartTime;
      employee.schedule.tuesday.endTime = defaultEndTime;
      employee.schedule.wednesday.startTime = defaultStartTime;
      employee.schedule.wednesday.endTime = defaultEndTime;
      employee.schedule.thursday.startTime = defaultStartTime;
      employee.schedule.thursday.endTime = defaultEndTime;
      employee.schedule.friday.startTime = defaultStartTime;
      employee.schedule.friday.endTime = defaultEndTime;
      employee.schedule.saturday.startTime = defaultStartTime;
      employee.schedule.saturday.endTime = defaultEndTime;
    }

    employee.save();

    return res.status(200);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getAllUserInfo = async (req, res) => {
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

    const allUsers = await User.find();

    const employees = allUsers.filter((user) => user.isEmployee);
    const users = allUsers.filter((user) => !user.isEmployee);

    console.log(employees, users);
    const employeeData = [];
    employees.map((employee) => {
      const coords = jwt.verify(user.location, process.env.SECRET).coords;
      employeeData.push({
        id: employee._id,
        profilePicture: employee.profilePicture,
        displayName: employee.displayName,
        email: employee.email,
        isEmployee: employee.isEmployee,
        location: coords,
        distance: employee.distance,
        services: employee.services,
        requestedDistance: employee.requestedDistance,
        requestedServices: employee.requestedServices,
        requestedLocation: employee.requestedLocation,
        vacationTime: employee.vacationTime,
        schedule: employee.schedule,
      });
    });

    const userData = [];
    users.map((user) => {
      userData.push({
        id: user._id,
        profilePicture: user.profilePicture,
        displayName: user.displayName,
        email: user.email,
        isEmployee: user.isEmployee,
      });
    });

    return res.status(200).json({ userData, employeeData });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUserInfo,
  updateEmployeeInfo,
  requestUpdateEmployeeInfo,
  getAllUserInfo,
  updateEmplyeeStatus,
  updateEmployeeSchedule,
};
