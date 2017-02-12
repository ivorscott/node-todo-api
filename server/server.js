require('./config/config')
const _ = require('lodash'),
      express = require('express'),
      bodyParser = require('body-parser'),
      {authenticate} = require('./middleware/authenticate'),
      {ObjectID} = require('mongodb'),
      {mongoose} = require('./db/mongoose'),
      {Todo} = require('./models/todo'),
      {User} = require('./models/user')

let = app = express()
app.use(bodyParser.json())

app.get('/users/me', authenticate, (req,res) => {
  res.send(req.user)
})

app.post('/users', (req,res) => {
  let body = _.pick(req.body, ['email','password'])
  let user = new User(body)

  user.createUser().then((token) => {
    res.header('x-auth',token).send(user)
  }).catch((e) => res.status(400).send(e))
});

app.post('/todos', (req,res) => {
  let text = req.body.text,
      todo = new Todo({text})

  todo.save().then((doc) => {
    res.send(doc)
  },(e) => res.status(400).send(e))
})

app.get('/todos', (req,res) => {
  Todo.find().then((todos) => {
    res.send({todos})
  },(e) => res.status(400).send(e))
})

app.get('/todos/:id', (req,res) => {
  let id = req.params.id

  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findById(id).then((todo) => {
    if(!todo) return res.status(404).send()
    res.send({todo})
  }).catch((e) => res.status(400).send())
})

app.delete('/todos/:id', (req,res) => {
  let id = req.params.id

  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findByIdAndRemove(id).then((todo) => {
    if(!todo) return res.status(404).send()
    res.send({todo})
  }).catch((e) => res.status(400).send())
})

app.patch('/todos/:id', (req,res) => {
  let id = req.params.id
  body = _.pick(req.body, ['text','completed'])

  if(!ObjectID.isValid(id)) return res.status(404).send()

  if(_.isBoolean(body.completed) && body.completed ){
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt - null
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if(!todo) return res.status(404).send()
    res.send({todo})
  }).catch((e) => res.status(400).send())
})

app.listen(process.env.PORT, () => console.log(`Started up at ${process.env.PORT}`))

module.exports = {app}
