const { ObjectID } = require('mongodb'),
      { Todo } = require('./../../api/models/todos.model'),
      { User } = require('./../../api/models/users.model'),
      jwt = require('jsonwebtoken'),
      userOneId = new ObjectID(),
      userTwoId = new ObjectID()

const users = [{
  _id: userOneId,
  "first-name": 'Ivor',
  "last-name": 'Cummings',
  email: 'test@gmail.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  "first-name": 'Tyler',
  "last-name": 'Cummings',
  email: 'test2@gmail.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}]

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  creator: userTwoId
}]

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos)
  }).then(() => done())
}

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let userOne = new User(users[0]).save()
    let userTwo  = new User(users[1]).save()
    return Promise.all([userOne,userTwo])
  }).then(() => done())
}

// Sample user attributes for POST & PATCH
const sampleAttributes = {
  'email': 'test@test.com',
  'password': '123123',
  'first-name': 'Julian',
  'last-name': 'Cummings'
}

module.exports = { todos, populateTodos, users, populateUsers, sampleAttributes }
