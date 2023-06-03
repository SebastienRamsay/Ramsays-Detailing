const router = require('express').Router()
const passport = require('passport');
const { LocalStorage } = require('node-localstorage')
const localStorage = new LocalStorage('./scratch')
require('../passport')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const { CreateCalendarEvent } = require('../controllers/googleCalenderAPI')

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

    CreateCalendarEvent({encodedUserId: userID, summary, location, description, startTime, endTime })
    
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