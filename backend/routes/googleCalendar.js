const router = require("express").Router();
const passport = require("passport");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
require("../passport");
const path = require("path");

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Detailing = require("../models/bookingModel");
const { google } = require("googleapis");

const keyFile = path.join(
  // get location of service account google auth file
  __dirname,
  "..",
  "ramsays-detailing-b3135e3f53f5.json"
);

// run a freebusy check on this calendar using this freeBusyQuery
const freeBusy = async function (calendar, freeBusyQuery) {
  const response = await calendar.freebusy.query(freeBusyQuery);
  const calendars = response.data.calendars;
  const primaryCalendar = calendars.primary;
  const busyTimeSlots = primaryCalendar.busy;
  // if busy return busyTimeSlots ^
  if (busyTimeSlots.length !== 0) {
    console.log("busy: ", busyTimeSlots);
    return busyTimeSlots;
  }
};

router.delete("/Calendar", async function (req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    var user_id = jwt.verify(token, process.env.SECRET).userID;

    const { eventId } = req.query; // get the eventId's from the requst

    if (!user_id) {
      console.log("user not logged in");
      return res.send("user not logged in");
    }

    const user = await User.findOne({ _id: user_id });
    const decodedUser = jwt.verify(user.clientCodes, process.env.SECRET);
    const refreshToken = decodedUser.refreshToken;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.ORIGIN
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const guestCalendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    const response = await guestCalendar.events.delete({
      auth: oauth2Client,
      calendarId: "primary",
      eventId: eventId,
    });
    console.log("EVENT DELETED FROM CALENDAR", response);
    return res.json({ message: "Event Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.delete("/calendar/cancel", async function (req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    var user_id = jwt.verify(token, process.env.SECRET).userID;

    if (!user_id) {
      return res.status(400).send("user not logged in");
    }

    const { employeeEventId, employeeId, userEventId, userId, bookingId } =
      req.body; // get the eventId's from the requst
    const booking = await Detailing.findById(bookingId);

    if (employeeEventId !== "none") {
      const user = await User.findOne({ _id: employeeId });
      const decodedUser = jwt.verify(user.clientCodes, process.env.SECRET);
      const refreshToken = decodedUser.refreshToken;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.ORIGIN
      );

      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const guestCalendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });

      const response = await guestCalendar.events.delete({
        auth: oauth2Client,
        calendarId: "primary",
        eventId: employeeEventId,
      });

      booking.employeeEventId = "none";
      console.log("EVENT DELETED FROM EMPLOYEES CALENDAR", response);
    }
    if (userEventId !== "none") {
      const user = await User.findOne({ _id: userId });
      const decodedUser = jwt.verify(user.clientCodes, process.env.SECRET);
      const refreshToken = decodedUser.refreshToken;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.ORIGIN
      );

      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const guestCalendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });

      const response = await guestCalendar.events.delete({
        auth: oauth2Client,
        calendarId: "primary",
        eventId: userEventId,
      });
      booking.userEventId = "none";
      console.log("EVENT DELETED FROM USERS CALENDAR", response);
    }
    booking.save();
    return res.json({ message: "Event Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
    return error;
  }
});

router.get("/calendar", async function (req, res) {
  try {
    const userID = req.cookies.user;
    let guestName = null;
    let isGuest = false;

    if (!userID) {
      console.log("User not logged in");
      return res.send("User not logged in");
    }

    if (userID === "guest") {
      guestName = req.cookies.name;
      isGuest = true;
    }

    let detailings;

    if (!isGuest) {
      const decodedUserID = jwt.verify(userID, process.env.SECRET);
      const user = await User.findOne({ _id: decodedUserID.user });
      detailings = await Detailing.find({ email: user.email });
    } else {
      detailings = await Detailing.find({ userId: guestName });
    }

    return res.json(detailings);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/admin/calendar", async function (req, res) {
  try {
    const isAdmin = req.cookies.admin;

    let detailings;

    if (isAdmin) {
      detailings = await Detailing.find();
    } else {
      return res.send("User is not an admin");
    }

    return res.json(detailings);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/calendar", async function (req, res) {
  try {
    let answeredQuestions = "";
    let summary = "";
    let description = "";
    let price = 0;
    let serviceTitles = [];

    const token = req.cookies.token;

    if (!token) {
      res.status(400).send("Not Logged In");
    }
    const user_id = jwt.verify(token, process.env.SECRET).userID;

    const { cart, selectedDateTime } = req.body;
    var userEventId = null;

    // MAKING EVENT DATA

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

    var startTime = selectedDateTime; // calculating times
    var endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + timeToComplete);

    const event = {
      summary: summary,
      location: cart.address,
      description: description,
      start: {
        dateTime: startTime,
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endTime,
        timeZone: "America/New_York",
      },
    };

    const services = [];
    cart.services.map((service) => {
      services.push(service.title);
    });

    const freeBusyQuery = {
      resource: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: "primary" }],
      },
    };

    // EVENT DATA COMPLETE

    try {
      // decode userid and get users refresh token
      const user = await User.findOne({ _id: user_id });
      const decodedUser = jwt.verify(user.clientCodes, process.env.SECRET);
      const refreshToken = decodedUser.refreshToken;
      // create oauth2
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.ORIGIN
      );
      // set user credentials
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      // make user calendar
      const userCalendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });

      // check if user is busy
      const guestBusyTimeSlots = await freeBusy(userCalendar, freeBusyQuery);
      // return if user is busy
      if (guestBusyTimeSlots) {
        return res.status(304).send("User is busy");
      }
      // insert event into users calendar
      const userResponse = await userCalendar.events.insert({
        auth: oauth2Client,
        calendarId: "primary",
        resource: event,
      });

      userEventId = userResponse.data.id;

      console.log("EVENT CREATED IN CALENDAR: ");
      console.dir(userResponse);
    } catch (error) {
      console.error("Error making user event:", error);
      return res.status(400).send("Error making user event: " + error.message);
    }

    return res.send(userEventId);
  } catch (error) {
    console.log("ERROR POSTING CALENDAR EVENT: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
