require('dotenv').config()
const passport = require('passport');
const refresh = require('passport-oauth2-refresh')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { LocalStorage } = require('node-localstorage')
const localStorage = new LocalStorage('./scratch')
const HttpsProxyAgent = require('https-proxy-agent');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const strategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://ramsays-detailing.onrender.com/auth/google/callback",
  scope: ['profile', 'https://www.googleapis.com/auth/calendar']
},
async function(accessToken, refreshToken, profile, done) {
  try {
    const salt = await bcrypt.genSalt()
    const hashedClientRefreshToken = await bcrypt.hash(refreshToken, salt)
    const hashedClientId = await bcrypt.hash(strategy._oauth2._clientId, salt)
    const hashedClientSecret = await bcrypt.hash(strategy._oauth2._clientSecret, salt)

    const clientCodes = jwt.sign(
      {
        refreshToken: refreshToken,
        clientSecret: strategy._oauth2._clientId,
        clientId: strategy._oauth2._clientSecret
      },
      process.env.SECRET
    )

    const existingUser = await User.findOne({ email: profile.email });
    if (existingUser) {
      // Update the existing user with the new clientCodes
      existingUser.clientCodes = clientCodes;

      await existingUser.save();
      const userID = jwt.sign(
        {
          user: existingUser._id
        },
        process.env.SECRET
      )
      localStorage.setItem('userID', userID)
      console.log(existingUser)

    } else {
      // Create a new user
      const user = await User.create({ 
        email: profile.email,
        displayName: profile.displayName,
        clientCodes: clientCodes
      });
      const userID = jwt.sign(
        {
          user: user._id
        },
        process.env.SECRET
      )
      localStorage.setItem('userID', userID)
      console.log(user)
    }
    

  } catch (error) {
    console.log('Error:', error);
    return error.message;
  }
  

  return done(null, profile);
})


refresh.use(strategy)

passport.use(strategy)

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});