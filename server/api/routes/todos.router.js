// USERS ROUTER
//==============================================================================

const express = require('express'),
      router = express.Router(),
      ctrlTodos = require('./../controllers/todos.controller'),
      authenticateUser = require('./../middleware/authenticateUser')

router
  .route('')
  .post(ctrlTodos.usersAddOne)

router
  .route('/login')
  .post(ctrlTodos.usersLogin)

router
  .route('/me')
  .all(authenticateUser)
  .get(ctrlTodos.usersGetMe)
  .patch(ctrlTodos.usersUpdateOne)

module.exports = router;

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
