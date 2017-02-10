const mongoose = require('mongoose'),
      validator = require('validator')

let User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  token:[{
    access:{
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

module.exports = {User}
