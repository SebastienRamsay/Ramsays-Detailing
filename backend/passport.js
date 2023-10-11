require("dotenv").config();
const passport = require("passport");
const refresh = require("passport-oauth2-refresh");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
const HttpsProxyAgent = require("https-proxy-agent");

const strategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://ramsaysdetailing.ca:4000/auth/google/callback",
    scope: ["profile", "https://www.googleapis.com/auth/calendar"],
  },
  async function (accessToken, refreshToken, profile, done) {
    try {
      const clientCodes = jwt.sign(
        {
          refreshToken: refreshToken,
          clientSecret: strategy._oauth2._clientId,
          clientId: strategy._oauth2._clientSecret,
        },
        process.env.SECRET
      );

      const existingUser = await User.findOne({ email: profile.email });
      if (existingUser) {
        // Update the existing user with the new clientCodes
        existingUser.clientCodes = clientCodes;

        await existingUser.save();
        const token = jwt.sign(
          {
            userID: existingUser._id,
          },
          process.env.SECRET
        );
        localStorage.clear();
        localStorage.setItem("token", token);
        console.log(existingUser);
      } else {
        // Create a new user
        const user = await User.create({
          email: profile.email,
          displayName: profile.displayName,
          profilePicture: profile.picture,
          clientCodes: clientCodes,
          isEmployee: false,
        });
        const token = jwt.sign(
          {
            userID: user._id,
          },
          process.env.SECRET
        );
        localStorage.clear();
        localStorage.setItem("token", token);
        console.log(user);
      }
    } catch (error) {
      console.log("Error:", error);
      return error.message;
    }

    return done(null, profile);
  }
);

refresh.use(strategy);

passport.use(strategy);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
