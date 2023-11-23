const router = require("express").Router();
const passport = require("passport");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
require("../passport");
const Reader = require("@maxmind/geoip2-node").Reader;
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

const loggedIn = async function (req, res) {
  try {
    // Specify the path to the GeoLite2-Country database
    const databasePath = "./GeoLite2-Country_20230915/GeoLite2-Country.mmdb";

    // Asynchronously open the database
    Reader.open(databasePath)
      .then((reader) => {
        // Now you can use methods suitable for a GeoLite2-Country database
        const response = reader.country(req.ip);
        console.log(response.country.isoCode); // Example usage
      })
      .catch((error) => {
        console.error("Error opening the GeoLite2-Country database:", error);
      });
    const token = req.cookies.token;

    if (!token) {
      console.log("USER IS A GUEST");
      return res.json({ loginType: "guest" });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    console.dir(decodedToken);

    const user = await User.findOne({ _id: userID });

    if (user.clientCodes) {
      const refreshToken = jwt.verify(
        user.clientCodes,
        process.env.SECRET
      ).refreshToken;

      const now = Math.floor(Date.now() / 1000);

      if (refreshToken.exp < now) {
        console.log("Refresh token has expired");
        return res.redirect("/logout");
      }
    }

    try {
      const adminToken = req.cookies.admin;
      const decodedToken = jwt.verify(adminToken, process.env.SECRET);
      const isAdmin = decodedToken.isAdmin;
      if (isAdmin) {
        console.log("LOGGED IN AS ADMIN");
        return res.json({
          loginType: "admin",
          adminInfo: {
            distance: user?.distance,
            location: user?.location,
            availableServices: user?.availableServices,
          },
        });
      }
    } catch (error) {
      // user is not an admin
    }

    try {
      if (user.isEmployee) {
        console.log("LOGGED IN AS Employee");
        return res.json({
          loginType: "employee",
          adminInfo: {
            distance: user?.distance,
            location: user?.location,
            availableServices: user?.services,
            vacationTime: user?.vacationTime,
            schedule: user?.schedule,
          },
        });
      }
    } catch (error) {
      console.log("error logging in as employee", error);
      // user is not an employee
    }

    return res.json({ loginType: "google" });
  } catch (error) {
    console.log("/LoggedIn: ", error);

    res.redirect("/logout");
  }
};

const adminAuth = async function (req, res) {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    const adminToken = jwt.sign({ isAdmin: true }, process.env.SECRET, {
      expiresIn: "1h",
    });
    res.cookie("admin", adminToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).json({ message: "Admin login successful" });
  } else {
    console.log("FAILED ADMIN LOGIN");
    res.status(200).json({ message: "Password is Incorrect" });
  }
};

const googleAuth = passport.authenticate("google", {
  scope: ["email", "profile", "https://www.googleapis.com/auth/calendar"],
  accessType: "offline",
  prompt: "consent",
});

const googleAuthCallback = passport.authenticate("google", {
  successRedirect: "/protected",
  failureRedirect: "/auth/google/failure",
});

const protected = async function (req, res) {
  const token = localStorage.getItem("token");

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
  });
  localStorage.clear();
  res.redirect("https://ramsaysdetailing.ca");
};

const logout = (req, res) => {
  localStorage.clear();
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    SameSite: "None",
    expires: new Date(0),
  });
  res.cookie("admin", "", {
    httpOnly: true,
    secure: true,
    SameSite: "None",
    expires: new Date(0),
  });
  console.log("Logged Out");
  res.send();
};

const googleAuthFail = (req, res) => {
  localStorage.clear();
  res.send("Failed to authenticate..");
};

module.exports = {
  googleAuthFail,
  logout,
  protected,
  googleAuthCallback,
  googleAuth,
  adminAuth,
  loggedIn,
};
