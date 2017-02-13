const { mongoose } = require('./../db/mongoose'),
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
  let User = this,
      userObject = User.toObject()
  return _.pick(userObject, ['_id','email'])
}

UserSchema.methods.generateAuthToken = function() {
  let User = this,
      access = 'auth',
      token = jwt.sign({_id: User._id.toHexString(), access}, 'abc123').toString()
  User.tokens.push({access, token})
  return User.save().then(() => token)
}

UserSchema.methods.createUser = UserSchema.methods.generateAuthToken

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

UserSchema.statics.findByCredentials = function(email, password) {
  let User = this
  return User.findOne({email}).then((user) => {
    if(!user) return Promise.reject()
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) {
          resolve(user)
        } else {
          reject()
        }
      })
    })
  })
}

UserSchema.pre('save', function(next) {
  let User = this

  if(User.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(User.password, salt, (err, hash) => {
        User.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

let User = mongoose.model('User', UserSchema)

module.exports = { User }
