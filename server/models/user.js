const mongoose = require('mongoose'),
      validator = require('validator'),
      jwt = require('jsonwebtoken'),
      _ = require('lodash'),
      Schema = mongoose.Schema

let UserSchema = new Schema({
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
  tokens:[{
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

UserSchema.methods.toJSON = function() {
  let user = this,
      userObject = user.toObject() 
  return _.pick(userObject, ['_id','email'])
}

UserSchema.methods.createUser = function() {
  let user = this,
      access = 'auth',
      token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString()
  user.tokens.push({access, token})
  return user.save().then(() => token)
}

let User = mongoose.model('User', UserSchema)

module.exports = {User}
