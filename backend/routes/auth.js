const router = require('express').Router()
const passport = require('passport');
const { LocalStorage } = require('node-localstorage')
const localStorage = new LocalStorage('./scratch')
require('../passport')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const { google } = require('googleapis')



function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.get('/LoggedIn', async function(req, res) {
  
  try{
    const userID = req.cookies.user;
    
    if (!userID) {
      console.log('user not logged in')
      return res.send(false)
    }

    const decodedUserID = jwt.verify(userID, process.env.SECRET)

    const user = await User.findOne({decodedUserID})

    const refreshToken = jwt.verify(user.clientCodes, process.env.SECRET).refreshToken

    const now = Math.floor(Date.now() / 1000);

    if (refreshToken.exp < now) {
      console.log('Refresh token has expired')
      res.redirect('http://localhost:4000/logout')
    }

    console.log('user is logged in')
    return res.send(true)
    
  }catch(error){

    console.log("/LoggedIn: ", error)

    res.redirect('http://localhost:4000/logout')
  }
  
  
});

router.post('/Calendar', async function(req, res) {
  try{
    const userID = req.cookies.user
    const { summary, location, description, startTime, endTime } = { ...req.body }
    
    if (!userID) {
      console.log('user not logged in')
      return res.send(false)
    }

    const decodedUserID = jwt.verify(userID, process.env.SECRET)

    const user = await User.findOne({decodedUserID})

    const decodedUser = jwt.verify(user.clientCodes, process.env.SECRET)

    const refreshToken = decodedUser.refreshToken

    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000'
    );

    oauth2Client.setCredentials({refresh_token: refreshToken})
    const calendar = google.calendar({ version: 'v3'});

    // Get the current date
    const currentDate = new Date();

    // Set the date for tomorrow
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);

    const event = {
      summary: 'Sample Event',
      location: 'Sample Location',
      description: 'This is a sample event created using the Google Calendar API.',
      start: {
        dateTime: currentDate.toISOString(),
        timeZone: 'America/New_York', // Eastern Standard Time (EST)
      },
      end: {
        dateTime: tomorrow.toISOString(),
        timeZone: 'America/New_York', // Eastern Standard Time (EST)
      },
      attendees: [
        { email: 'attendee1@example.com' },
        { email: 'attendee2@example.com' },
      ],
    };

    try {
      const response = await calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary', // Use 'primary' for the authenticated user's primary calendar
        resource: event,
      });

      console.log('Event created:', response.data);
    } catch (error) {
      console.error('Error creating event:', error);
    }
    //CreateCalendarEvent({ oauth2Client, summary, location, description, startTime, endTime })
    
  }catch(error){

    console.log("/LoggedIn: ", error)

    res.redirect('http://localhost:4000/logout')
  }

  
})

router.get('/auth/google',
  passport.authenticate('google', 
  { scope: [ 'email', 'profile', 'https://www.googleapis.com/auth/calendar' ],
  accessType: 'offline',
  prompt: 'consent' }
));

router.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/google/failure'
  })
);

router.get('/protected', isLoggedIn, async function(req, res) {
  const userID = localStorage.getItem('userID')
  res.cookie("user", userID, {
    httpOnly: true
  })

  res.redirect('http://localhost:3000/services')
});

router.get('/logout', (req, res) => {
    res.cookie('user', "", {
      httpOnly: true,
      expires: new Date(0)
    }).send()
    console.log('Logged Out')
});

router.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

module.exports = router