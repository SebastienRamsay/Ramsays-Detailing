const router = require("express").Router();
const passport = require("passport");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
require("../passport");
const path = require("path");

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { google } = require("googleapis");
const { start } = require("repl");

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.get("/assistant", async function getGPT3Response() {
  const endpoint = "https://api.openai.com/v1/engines/gpt-3.5/tokens/complete";

  const chatHistory = [
    {
      role: "system",
      content:
        "You are an assistant for Ramsay's Detailing. You will only talk about detailing related topics, if the question is not about detailing or the buisness then you do not know the answer. Do not say anything that is not true. You can provide links to ramsaysdetailing.ca/home, ramsaysdetailing.ca/services, ramsaysdetailing.ca/about. use this json data to provide useful information to the user if requested: ",
    },
    { role: "user", content: "who are you?" },
  ];

  const prompt = chatHistory
    .map((entry) => `${entry.role}: ${entry.content}`)
    .join("\n");
  const maxTokens = 100; // Set the maximum number of tokens for the response.

  try {
    const response = await axios.post(
      endpoint,
      {
        prompt,
        max_tokens: maxTokens,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const generatedText = response.data.choices[0].text;
    console.log(generatedText);

    // Add the AI's response to the chat history
    chatHistory.push({ role: "ai", content: generatedText });
  } catch (error) {
    console.error("Error:", error.message);
  }
});

router.get("/LoggedIn", async function (req, res) {
  try {
    const userID = req.cookies.user;

    if (!userID) {
      console.log("user not logged in");
      return res.send(false);
    }

    if (userID === "guest") {
      const guestName = req.cookies.name;
      console.log("guest logged in: " + guestName);
      return res.send("guest");
    }

    const decodedUserID = jwt.verify(userID, process.env.SECRET);

    const user = await User.findOne({ decodedUserID });

    const refreshToken = jwt.verify(
      user.clientCodes,
      process.env.SECRET
    ).refreshToken;

    const now = Math.floor(Date.now() / 1000);

    if (refreshToken.exp < now) {
      console.log("Refresh token has expired");
      res.redirect("/logout");
    }
    console.log("user is logged in");

    return res.send(true);
  } catch (error) {
    console.log("/LoggedIn: ", error);

    res.redirect("/logout");
  }
});

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile", "https://www.googleapis.com/auth/calendar"],
    accessType: "offline",
    prompt: "consent",
  })
);

router.post("/guest", async function (req, res) {
  const { name } = req.body;

  res.cookie("user", "guest", {
    httpOnly: true,
    secure: false,
  });

  res.cookie("name", name, {
    httpOnly: true,
    secure: false,
  });

  res.status(200).json({ message: "Guest login successful" });
});

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/auth/google/failure",
  })
);

router.get("/protected", isLoggedIn, async function (req, res) {
  const userID = localStorage.getItem("userID");
  res.cookie("user", userID, {
    httpOnly: true,
    domain: ".ramsaysdetailing.ca",
    secure: "false",
    SameSite: "None",
  });

  res.redirect(process.env.ORIGIN);
});

router.get("/logout", (req, res) => {
  res.cookie("user", "", {
    httpOnly: true,
    secure: "false",
    SameSite: "None",
    expires: new Date(0),
  });
  res.cookie("name", "", {
    httpOnly: true,
    secure: "false",
    sameSite: "None",
    expires: new Date(0),
  });
  console.log("Logged Out");
  res.send();
});

router.get("/auth/google/failure", (req, res) => {
  res.send("Failed to authenticate..");
});

router.get("/busyEvents", async (req, res) => {
  try {
    const keyFile = path.join(
      __dirname,
      "..",
      "ramsays-detailing-b3135e3f53f5.json"
    );

    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Fetch the busy events from the Google Calendar API
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 25,
      singleEvents: true,
      orderBy: "startTime",
    });

    const busyEvents = response.data.items.map((event) => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      summary: event.summary,
      isAllDay: !event.start.dateTime && !event.end.dateTime,
    }));

    res.json(busyEvents);
  } catch (error) {
    console.error("Error fetching busy events:", error);
    res.status(500).json({ error: "Error fetching busy events" });
  }
});

const freeBusy = async function (calendar, event, freeBusyQuery, auth) {
  const response = await calendar.freebusy.query(freeBusyQuery);
  const calendars = response.data.calendars;
  const primaryCalendar = calendars.primary;

  // Process busy time slots for the primary calendar
  const busyTimeSlots = primaryCalendar.busy;

  if (busyTimeSlots.length === 0) {
    try {
      const response = await calendar.events.insert({
        auth: auth,
        calendarId: "primary",
        resource: event,
      });

      console.log("Event created:", response.data);
    } catch (error) {
      throw new Error("Error creating event:", error);
    }
  } else {
    console.log(`busy: ${busyTimeSlots}`);
    return busyTimeSlots;
  }

  // Iterate over each busy time slot
  // for (const timeSlot of busyTimeSlots) {
  //   const start = new Date(timeSlot.start);
  //   const end = new Date(timeSlot.end);

  // }
};

router.post("/Calendar", async function (req, res) {
  try {
    const userID = req.cookies.user;
    const { summary, location, description, startTime, endTime } = req.body;

    const event = {
      summary: summary,
      location: location,
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

    if (!userID) {
      console.log("User not logged in");
      return res.status(401).send("User not logged in");
    }

    const freeBusyQuery = {
      resource: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: "primary" }],
      },
    };

    const keyFile = path.join(
      __dirname,
      "..",
      "ramsays-detailing-c3736ce730e8.json"
    );
    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const calendar = google.calendar({ version: "v3", auth });
    try {
      const busyTimeSlots = await freeBusy(
        calendar,
        event,
        freeBusyQuery,
        auth
      );
      if (busyTimeSlots) {
        return res.send("Ramsays Detailing is busy");
      }
    } catch (error) {
      console.log("error creating Ramsays Detailing event: ", error);
    }

    if (userID !== "guest") {
      try {
        const decodedUserID = jwt.verify(userID, process.env.SECRET);
        const user = await User.findOne({ _id: decodedUserID.user });
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

        try {
          const guestBusyTimeSlots = await freeBusy(
            guestCalendar,
            event,
            freeBusyQuery,
            oauth2Client
          );
          if (guestBusyTimeSlots) {
            return res.send("User is busy");
          }
        } catch (error) {
          console.log("error creating user event: ", error);
        }

        return res.send("Events created in calendar");
      } catch (error) {
        console.error("Error making user event:", error);
        return res
          .status(400)
          .send("Error making user event: " + error.message);
      }
    }
  } catch (error) {
    console.error("/Calendar:", error);
    res.status(400).send("/Calendar: " + error.message);
  }
});

module.exports = router;
