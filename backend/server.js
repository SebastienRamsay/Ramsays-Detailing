require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");
const passportSetup = require("./passport");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const usersRoutes = require("./routes/users");
const serviceRoutes = require("./routes/service");
const adminServiceRoutes = require("./routes/adminService");
const bookingRoutes = require("./routes/booking");
const cartRoutes = require("./routes/cart");
const authRoute = require("./routes/auth");
const calendarRoute = require("./routes/googleCalendar");
const googlePlacesAPI = require("./routes/googlePlacesAPI");
const uploadRoutes = require("./routes/uploads");
const stripeRoutes = require("./routes/stripe");
const session = require("express-session");
const fs = require("node:fs");
const https = require("https");
const { requireAuth } = require("./middleware/requireAuth");

// express app
const app = express();

app.use((req, res, next) => {
  if (req.secure) {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});

const privateKey = fs.readFileSync("../../../../../../ssl/private.key.pem");
const certificate = fs.readFileSync("../../../../../../ssl/domain.cert.pem");
const ca = fs.readFileSync("../../../../../../ssl/intermediate.cert.pem");

// const privateKey = fs.readFileSync("../../ssl/private.key.pem");
// const certificate = fs.readFileSync("../../ssl/domain.cert.pem");
// const ca = fs.readFileSync("../../ssl/intermediate.cert.pem");

const credentials = { key: privateKey, cert: certificate, ca: ca };

// Create an HTTP/2 server using http2.createSecureServer
const https2Server = https.createServer(credentials, app);

// middleware
app.use(
  cors({
    origin: JSON.parse(process.env.ORIGIN),
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/images", express.static(__dirname + "/images"));

// google auth
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// log method and path
app.use((req, res, next) => {
  console.log(req.path, req.method, req.ip);
  next();
});

// google auth routes
app.use(authRoute);

app.use("/api/services", serviceRoutes);

// Middleware for routes that require authentication
app.use(requireAuth);

// routes
app.use("/api/admin/services", adminServiceRoutes);
app.use("/api/user", usersRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/cart", cartRoutes);
app.use(googlePlacesAPI);
app.use(calendarRoute);
app.use("/upload", uploadRoutes);
app.use("/stripe", stripeRoutes);

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to database");
    // listen to port
    https2Server.listen(process.env.PORT, () => {
      console.log("Server running on HTTPS port", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
