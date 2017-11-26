require('colour')

// DATABASE CONNECTION
//==============================================================================

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI)

// MONITOR CONNECTION EVENTS
//==============================================================================

mongoose.connection.once('connected', () => {
  console.log('Mongoose connected to '.green + process.env.MONGODB_URI)
})
mongoose.connection.on('error', err => {
  console.log('Mongoose connection error: '.red + process.env.MONGODB_URI)
})
mongoose.connection.on('disconnected', () => {
  console.log('\nMongoose disconnected'.red)
})

// CAPTURE APP TERMINATION & RESTART EVENTS TO SHUTDOWN DATABASE CONNECTION
//==============================================================================
// To be called when process is restarted or terminated

function gracefulShutdown(msg, callback) {
  mongoose.connection.close( () => {
    console.log('Mongoose disconnected through '.red + msg)
    callback()
  })
}
// For nodemon restarts
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2')
  })
})
// For app termination
process.on('SIGINT', () => {
  gracefulShutdown('App termination (SIGINT)', () => {
    process.exit(0)
  })
})
// For Heroku app termination
process.on('SIGTERM', () => {
  gracefulShutdown('App termination (SIGTERM)', () => {
    process.exit(0)
  })
})

// INITIALIZE MODELS
//==============================================================================

require('./models/user.model')
require('./models/todo.model')
