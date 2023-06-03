// Require google from googleapis package.
const { google } = require('googleapis')
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')

// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth

async function CreateCalendarEvent(encodedUserId, summary, location, description, startTime, endTime){


    const decodedUserID = jwt.verify(encodedUserId.encodedUserId, process.env.SECRET)

    const user = await User.findOne({decodedUserID})

    const decodedUser = jwt.verify(user.clientCodes, process.env.SECRET)

    const refreshToken = decodedUser.refreshToken

    const clientId = decodedUser.clientId

    const clientSecret = decodedUser.clientSecret


    // Create a new OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
        'YOUR_CLIENT_ID',
        'YOUR_CLIENT_SECRET',
        'YOUR_REDIRECT_URI'
    );
  
    // Generate the URL for user authorization
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
    });
    
    // Redirect the user to the authorization URL
    // After authorization, Google will redirect the user back to YOUR_REDIRECT_URI
    console.log('Authorize this app by visiting this URL:', authUrl);
    
    // After authorization, exchange the authorization code for an access token
    const code = 'AUTHORIZATION_CODE';
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Create a new event start date instance for temp uses in our calendar.
    const eventStartTime = new Date()
    eventStartTime.setDate(eventStartTime.getDay() + 2)

    // Create a new event end date instance for temp uses in our calendar.
    const eventEndTime = new Date()
    eventEndTime.setDate(eventEndTime.getDay() + 4)
    eventEndTime.setMinutes(eventEndTime.getMinutes() + 45)

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    const event = {
    summary: summary,
    location: location,
    description: description,
    start: {
        dateTime: startTime,
        timeZone: 'Eastern Standard',
    },
    end: {
        dateTime: endTime,
        timeZone: 'Eastern Standard',
    },
    };

    const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
    });

    console.log('Event created:', response.data);

    }

module.exports ={
    CreateCalendarEvent
} 
