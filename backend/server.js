require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const workoutRoutes = require('./routes/workouts')
const usersRoutes = require('./routes/users')
const serviceRoutes = require('./routes/service')
const detialingRoutes = require('./routes/detailing')

// express app
const app = express()

// middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

app.use('/images', express.static(__dirname + '/images'))

// routes
app.use('/api/workouts', workoutRoutes)
app.use('/api/user', usersRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/detailings', detialingRoutes)

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