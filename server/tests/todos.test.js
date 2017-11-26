const expect = require('expect'),
      { app, headers, namespace } = require('./../server'),
      request = require('supertest'),
      { ObjectID } = require('mongodb'),
      { Todo } = require('./../api/models/todos.model'),
      { User } = require('./../api/models/users.model'),
      { todos, users, populateTodos , populateUsers } = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text'

    request(app)
      .post(`${namespace}/todos`)
      .set(headers[0], users[0].tokens[0].token)
      .send({text})
      .expect(200)
      .expect((res)=> {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if(err) {
          return done(err); // return not needed but stops further execution
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        })
        .catch((e) => done(e))
      })
  })

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post(`${namespace}/todos`)
      .set(headers[0], users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err) return done(err)
        Todo.find().then((todos) => {
          expect(todos.length).toBe(2)
          done()
        })
        .catch((e) => done(e))
      })
  })
})

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get(`${namespace}/todos`)
      .set(headers[0], users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`${namespace}/todos/${todos[0]._id.toHexString()}`)
      .set(headers[0], users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`${namespace}/todos/${todos[1]._id.toHexString()}`)
      .set(headers[0],users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 if todo not found', (done) => {
    let id = new ObjectID().toHexString();

    request(app)
      .get(`${namespace}/todos/${id}`)
      .set(headers[0],users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`${namespace}/todos/asdf`)
      .set(headers[0],users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let id = todos[1]._id.toHexString();

    request(app)
      .delete(`${namespace}/todos/${id}`)
      .set(headers[0],users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id)
      })
      .end((err,res) => {
        if(err) return done(err)

        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist()
          done()
        })
        .catch((e)=> done(e))
      })
  })

  it('should not remove a todo the user doesn\'t own'  , (done) => {
    let id = todos[0]._id.toHexString();

    request(app)
      .delete(`${namespace}/todos/${id}`)
      .set(headers[0],users[1].tokens[0].token)
      .expect(404)
      .end((err,res) => {
        if(err) return done(err)

        Todo.findById(id).then((todo) => {
          expect(todo).toExist()
          done()
        })
        .catch((e)=> done(e))
      })
  })

  it('should return 404 if todo not found', (done) => {
    let id = new ObjectID().toHexString();

    request(app)
      .delete(`${namespace}/todos/${id}`)
      .set(headers[0],users[1].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .delete(`${namespace}/todos/asdf`)
      .set(headers[0],users[1].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let id = todos[0]._id.toHexString(),
        text = 'This should be the new text'

    request(app)
      .patch(`${namespace}/todos/${id}`)
      .set(headers[0],users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(true)
        expect(res.body.todo.completedAt).toBeA('number')
      })
      .end(done)
  })

  it('should not update a todo created by other user', (done) => {
    let id = todos[0]._id.toHexString(),
        text = 'This should be the new text'

    request(app)
      .patch(`${namespace}/todos/${id}`)
      .set(headers[0],users[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404 )
      .end(done)
  })

  it('should clear completedAt when todo is not completed', (done) => {
    let id = todos[1]._id.toHexString(),
        text = 'This should be the new text!!'

    request(app)
      .patch(`${namespace}/todos/${id}`)
      .set(headers[0],users[1].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toNotExist()
      })
      .end(done)
  })
})
