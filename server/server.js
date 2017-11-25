require('./config/config')
const _ = require('lodash'),
      express = require('express'),
      cors = require('cors'),
      bodyParser = require('body-parser'),
      JSONAPISerializer = require('jsonapi-serializer').Serializer,
      { authenticate } = require('./middleware/authenticate'),
      { ObjectID } = require('mongodb'),
      { mongoose } = require('./db/mongoose'),
      { Todo } = require('./models/todo'),
      { User } = require('./models/user')

let = app = express()

let corsOptions = { exposedHeaders: 'X-Auth' }

app.options('*', cors(corsOptions))

app.use(bodyParser.json())

app.post('/users/login', (req,res) => {
  let body = _.pick(req.body, ['email','password'])

  User.findByCredentials(body.email, body.password).then((user) => {

    let json = new JSONAPISerializer('users', {
      attributes: User.attributes()
    }).serialize(user);

    return user.generateAuthToken().then((token) => {
      res.header('X-Auth',token).send(json)
    })
  })
  .catch((e) => res.status(400).send(e))
})

app.delete('/users/:id/token', authenticate, (req,res) => {
  let _id = req.params.id

  if(!ObjectID.isValid(_id)) return res.status(404).send()
  if(req.user._id.toHexString() !== _id) return res.status(400).send()

  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  })
  .catch((e) => res.status(400).send(e))
})

app.patch('/users/:id', authenticate, (req,res) => {
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
})

app.get('/users/:id', authenticate, (req,res) => {
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
})
app.post('/users', (req,res) => {
  let body = _.pick(req.body, ['email','password','firstName','lastName'])
  let user = new User(body)
  let json = new JSONAPISerializer('users', {
    attributes: User.attributes()
  }).serialize(user);

  user.generateAuthToken().then((token) => {
    res.header('X-Auth',token).send(json)
  })
  .catch((e) => res.status(400).send(e))
});

app.post('/todos', authenticate, (req,res) => {
  let todo = new Todo({
    text:req.body.text,
    _creator: req.user._id
  })

  todo.save().then((doc) => {
    res.send(doc)
  }).catch((e) => res.status(400).send(e))
})

app.get('/todos', authenticate, (req,res) => {
  // find todos where the creator is the authenticated user
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos})
  },
  (e) => res.status(400).send(e))
})

app.get('/todos/:id', authenticate, (req,res) => {
  let id = req.params.id

  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send()
    res.send({todo})
  })
  .catch((e) => res.status(400).send(e))
})

app.delete('/todos/:id', authenticate, (req,res) => {
  let id = req.params.id

  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send()
    res.send({todo})
  })
  .catch((e) => res.status(400).send(e))
})

app.patch('/todos/:id', authenticate, (req,res) => {
  let id = req.params.id,
      body = _.pick(req.body, ['text','completed'])

  if(!ObjectID.isValid(id)) return res.status(404).send()

  if(_.isBoolean(body.completed) && body.completed ){
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {$set: body}, {new: true}).then((todo) => {
    if(!todo) return res.status(404).send()
    res.send({todo})
  })
  .catch((e) => res.status(400).send(e))
})

if(!module.parent) {
  app.listen(process.env.PORT, () => console.log(`
    NODE_ENV ${process.env.NODE_ENV} Started up at ${process.env.PORT}`))
}

module.exports = { app }
