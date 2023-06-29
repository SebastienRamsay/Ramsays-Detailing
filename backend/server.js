require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const passport = require('passport')
const cookieSession = require('cookie-session')
const passportSetup = require("./passport")
const cookieParser = require('cookie-parser')

const workoutRoutes = require('./routes/workouts')
const usersRoutes = require('./routes/users')
const serviceRoutes = require('./routes/service')
const detialingRoutes = require('./routes/detailing')
const cartRoutes = require('./routes/cart')
const authRoute = require('./routes/auth')
const googlePlacesAPI = require('./routes/googlePlacesAPI')
const session = require('express-session');



// express app
const app = express()

// middleware
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true
  })
)
app.use(express.json())
app.use(cookieParser())

app.use('/images', express.static(__dirname + '/images'))


// google auth
app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());





// google auth routes
app.use(authRoute)


// log method and path
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})



// routes
app.use('/api/workouts', workoutRoutes)
app.use('/api/user', usersRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/detailings', detialingRoutes)
app.use('/api/cart', cartRoutes)
app.use(googlePlacesAPI)

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('connected to database')
    // listen to port
    app.listen(process.env.PORT, () => {
      console.log('listening for requests on port', process.env.PORT)
    })
  })
  .catch((err) => {
    console.log(err)
  }) 