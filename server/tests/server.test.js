const expect = require('expect'),
      { app } = require('./../server'),
      request = require('supertest'),
      { ObjectID } = require('mongodb'),
      { Todo } = require('./../models/todo'),
      { User } = require('./../models/user'),
      { todos, users, populateTodos , populateUsers } = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text'

    request(app)
      .post('/todos')
      .set('x-auth',users[0].tokens[0].token)
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
      .post('/todos')
      .set('x-auth',users[0].tokens[0].token)
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
      .get('/todos')
      .set('x-auth',users[0].tokens[0].token)
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
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 if todo not found', (done) => {
    let id = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${id}`)
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get(`/todos/asdf`)
      .set('x-auth',users[0].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth',users[1].tokens[0].token)
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
      .delete(`/todos/${id}`)
      .set('x-auth',users[1].tokens[0].token)
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
      .delete(`/todos/${id}`)
      .set('x-auth',users[1].tokens[0].token)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .delete(`/todos/asdf`)
      .set('x-auth',users[1].tokens[0].token)
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let id = todos[0]._id.toHexString(),
        text = 'This should be the new text'

    request(app)
      .patch(`/todos/${id}`)
      .set('x-auth',users[0].tokens[0].token)
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
      .patch(`/todos/${id}`)
      .set('x-auth',users[1].tokens[0].token)
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
      .patch(`/todos/${id}`)
      .set('x-auth',users[1].tokens[0].token)
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

describe('GET /users/:id', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get(`/users/${users[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(users[0]._id.toHexString())
        expect(res.body.user.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get(`/users/${users[0]._id.toHexString()}`)
      .set('x-auth', '')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

describe('POST /users', () => {
  it('should create a user', (done) => {
    let email = 'test@test.com',
        password = '123123',
        firstName = 'Julian',
        lastName = users[0].lastName

    request(app)
      .post('/users')
      .send({email, password, firstName, lastName})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist()
        expect(res.body._id).toExist()
        expect(res.body.email).toBe(email)
        expect(res.body.firstName).toBe(firstName)
        expect(res.body.lastName).toBe(lastName)
      })
      .end((err) => {
        if(err) return done(err)

        User.findOne({email}).then((user) => {
          expect(user).toExist()
          expect(user.password).toNotBe(password)
          done()
        }).catch((e) => done(e))
      })
  })

  it('should return validation error if email is invalid', (done) => {
    request(app)
      .post('/users')
      .send({email:'abc'})
      .expect(400)
      .end(done)
  })

  it('should return validation error if password is invalid', (done) => {
    request(app)
      .post('/users')
      .send({password:'123'})
      .expect(400)
      .end(done)
  })

  it('should return validation error if firstName is invalid', (done) => {
    request(app)
      .post('/users')
      .send({firstName:''})
      .expect(400)
      .end(done)
  })

  it('should return validation error if lastName is invalid', (done) => {
    request(app)
      .post('/users')
      .send({lastName:''})
      .expect(400)
      .end(done)
  })

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({email: users[0].email, password:'abc123'})
      .expect(400)
      .end(done)
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist()
      })
      .end((err, res) => {
        if(err) return done(err)

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          })
          done()
        }).catch((e) => done(e))
      })
  })

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist()
      })
      .end((err, res) => {
        if(err) return done(err)

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1)
          done()
        }).catch((e) => done(e))
      })
  })
})

describe('DELETE /users/:id/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
    .delete(`/users/${users[0]._id.toHexString()}/token`)
    .set('x-auth', users[0].tokens[0].token)
    .expect(200)
    .end((err, res) => {
      if(err) return done(err)

      User.findById(users[0]._id).then((user) => {
        expect(user.tokens.length).toBe(0)
        done()
      }).catch((e) => done(e))
    })
  })
})
