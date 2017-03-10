require('./config/config')
const _ = require('lodash'),
      express = require('express'),
      cors = require('cors'),
      bodyParser = require('body-parser'),
      { authenticate } = require('./middleware/authenticate'),
      { ObjectID } = require('mongodb'),
      { mongoose } = require('./db/mongoose'),
      { Todo } = require('./models/todo'),
      { User } = require('./models/user')

let = app = express()

let corsOptions = { exposedHeaders: 'x-auth'; }

app.options('*', cors(corOptions))

app.use(bodyParser.json())

app.post('/users/login', (req,res) => {
  let body = _.pick(req.body, ['email','password'])

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth',token).send(user)
    })
  })
  .catch((e) => res.status(400).send())
})

app.delete('/users/me/token', authenticate, (req,res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  })
  .catch((e) => res.status(400).send())
})

app.get('/users/me', authenticate, (req,res) => {
  res.send(req.user)
})

app.post('/users', (req,res) => {
  let body = _.pick(req.body, ['email','password'])
  let user = new User(body)

  user.generateAuthToken().then((token) => {
    res.header('x-auth',token).send(user)
  })
  .catch((e) => res.status(400).send())
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
  .catch((e) => res.status(400).send())
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
  .catch((e) => res.status(400).send())
})

app.patch('/todos/:id', authenticate, (req,res) => {
  let id = req.params.id
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
  .catch((e) => res.status(400).send())
})

app.listen(process.env.PORT, () => console.log(`Started up at ${process.env.PORT}`))

module.exports = { app }
