const _ = require('lodash'),
      JSONAPISerializer = require('jsonapi-serializer').Serializer,
      { ObjectID } = require('mongodb'),
      { Todo } = require('./../models/todos.model')

module.exports.todosAddOne = (req, res, next) => {
  let text = req.data.text
  let todo = new Todo({
    text,
    creator: req.user._id
  })

  todo.save()
  .then((todo) => {
    req.type = Todo.type()
    req.attributes = Todo.attributes()
    req.data = todo
    next()
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.todosGetAll = (req, res, next) => {
  Todo.find({
    creator: req.user._id
  }).then((todos) => {
    req.type = Todo.type()
    req.attributes = Todo.attributes()
    req.data = todos
    next()
  })
  .catch((e)=> res.status(400).send(e))
}

module.exports.todosGetOne = (req, res, next) => {
  let id = req.params.id

  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findOne({
    _id: id,
    creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send()
    req.type = Todo.type()
    req.attributes = Todo.attributes()
    req.data = todo
    next()
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.todosUpdateOne = (req, res, next) => {
  let id = req.params.id,
      body = _.pick(req.data, ['text','completed'])

  if(!ObjectID.isValid(id)) return res.status(404).send()

  if(_.isBoolean(body.completed) && body.completed ){
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Todo.findOneAndUpdate(
  { _id: id, creator: req.user._id },
  { $set: body },
  { new: true })
  .then((todo) => {
    if(!todo) return res.status(404).send()
    req.type = Todo.type()
    req.attributes = Todo.attributes()
    req.data = todo
    next()
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.todosDeleteOne = (req, res, next) => {
  let id = req.params.id

  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findOneAndRemove({
    _id: id,
    creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send()
    req.type = Todo.type()
    req.attributes = Todo.attributes()
    req.data = todo
    next()
  })
  .catch((e) => res.status(400).send(e))
}
