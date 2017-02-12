const mongoose = require('mongoose'),
      validator = require('validator'),
      jwt = require('jsonwebtoken'),
      _ = require('lodash'),
      bcrypt = require('bcryptjs'),
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

UserSchema.statics.findbyToken = function(token){
  var User = this,
      decoded
  try {
    decoded = jwt.verify(token,'abc123')
  } catch(e) {
    return Promise.reject()
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token
  })
}

UserSchema.pre('save', function(next) {
  let user = this

  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

let User = mongoose.model('User', UserSchema)

module.exports = {User}
