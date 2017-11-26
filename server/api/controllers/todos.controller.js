const _ = require('lodash'),
      JSONAPISerializer = require('jsonapi-serializer').Serializer,
      { ObjectID } = require('mongodb'),
      { Todo } = require('./../models/todos.model')

module.exports.todosAddOne = (req, res) => {
  let todo = new Todo({
    text:req.body.text,
    creator: req.user._id
  })

  todo.save().then((todo) => {
    let json = new JSONAPISerializer('todos', {
      attributes: Todo.attributes()
    }).serialize(todo);

    res.send(json)
  }).catch((e) => res.status(400).send(e))
}

module.exports.todosGetOne = (req, res) => {
  Todo.find({
    creator: req.user._id
  }).then((todos) => {

    let json = new JSONAPISerializer('todos', {
      attributes: Todo.attributes()
    }).serialize(todos);

    res.send(json)
  },
  (e) => res.status(400).send(e))
}

module.exports.todosGetAll = (req, res) => {
  Todo.find({
    creator: req.user._id
  }).then((todos) => {

    let json = new JSONAPISerializer('todos', {
      attributes: Todo.attributes()
    }).serialize(todos);

    res.send(json)
  },
  (e) => res.status(400).send(e))
}

module.exports.todosGetOne = (req, res) => {
  let id = req.params.id

  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findOne({
    _id: id,
    creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send()

    let json = new JSONAPISerializer('todos', {
      attributes: Todo.attributes()
    }).serialize(todo);

    res.send(json)
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.todosUpdateOne = (req, res) => {
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
    creator: req.user._id
  }, {$set: body}, {new: true}).then((todo) => {
    if(!todo) return res.status(404).send()

    let json = new JSONAPISerializer('todos', {
      attributes: Todo.attributes()
    }).serialize(todo);

    res.send(json)
  })
  .catch((e) => res.status(400).send(e))
}

module.exports.todosDeleteOne = (req, res) => {
  let id = req.params.id

  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findOneAndRemove({
    _id: id,
    creator: req.user._id
  }).then((todo) => {
    if(!todo) return res.status(404).send()

    let json = new JSONAPISerializer('todos', {
      attributes: Todo.attributes()
    }).serialize(todo);

    res.send(json)
  })
  .catch((e) => res.status(400).send(e))
}
