const _ = require('lodash'),
      JSONAPISerializer = require('jsonapi-serializer').Serializer,
      { ObjectID } = require('mongodb'),
      { User } = require('./../models/users.model')

module.exports.usersLogin = (req, res) => {
  let body = _.pick(req.body, ['email','password'])

  User.findByCredentials(body.email, body.password).then((user) => {

    let json = new JSONAPISerializer('users', {
      attributes: User.attributes()
    }).serialize(user);

    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(json)
    })
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.usersRemoveToken = (req, res) => {
  let _id = req.params.id

  if(!ObjectID.isValid(_id)) return res.status(404).send()
  if(req.user._id.toHexString() !== _id) return res.status(400).send()

  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.usersUpdateOne = (req, res) => {
  let id = req.params.id,
  body = _.pick(req.body, ['firstName', 'lastName', 'email'])

  if(!ObjectID.isValid(id)) return res.status(404).send()
  if(req.user._id.toHexString() !== id) return res.status(400).send()

  User.findOneAndUpdate({
    _id: id,
  }, {$set: body}, {new: true}).then((user) => {
    if(!user) return res.status(404).send()

    let json = new JSONAPISerializer('users', {
      attributes: User.attributes()
    }).serialize(user);

    res.send(json)
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.usersGetOne = (req, res) => {
  let _id = req.params.id

  if(!ObjectID.isValid(_id)) return res.status(404).send()

  User.findOne({ _id })
  .then((user) => {
    if(!user) return res.status(404).send()
    let json = new JSONAPISerializer('users', {
      attributes: User.attributes()
    }).serialize(user);
    res.send(json)
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.usersAddOne = (req, res) => {
  let body = _.pick(req.body, ['email','password','firstName','lastName'])
  let user = new User(body)
  user.generateAuthToken().then((token) => {
    let json = new JSONAPISerializer('users', {
      attributes: User.attributes()
    }).serialize(user);
    res.header('x-auth', token).send(json)
  })
  .catch((e) => res.status(400).send(e))

}
