const expect = require('expect'),
      { app, namespace } = require('./../server'),
      request = require('supertest'),
      { ObjectID } = require('mongodb'),
      { Todo } = require('./../api/models/todos.model'),
      { User } = require('./../api/models/users.model'),
      { todos, users, populateTodos , populateUsers } = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('GET /users/:id', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get(`${namespace}/users/${users[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        const {
          data,
          data: { attributes }
        } = res.body

        expect(data.id).toBe(users[0]._id.toHexString())
        expect(attributes.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get(`${namespace}/users/${users[0]._id.toHexString()}`)
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
    let attributes = {
      email: 'test@test.com',
      password: '123123',
      firstName: 'Julian',
      lastName: users[0]['last-name']
    }

    request(app)
      .post(`${namespace}/users`)
      .set('content-type', 'application/vnd.api+json')
      .send({
        data: {
          attributes
        }
      })
      .expect(200)
      .expect((res) => {
        const {
          data,
          data: { attributes }
        } = res.body

        expect(res.headers['x-auth']).toExist()
        expect(data.id).toExist()
        expect(attributes['email']).toBe(email);
        expect(attributes['last-name']).toBe(lastName);
        expect(attributes['first-name']).toBe(firstName);
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
    let email = 'test',
        password = '123123',
        firstName = 'Julian',
        lastName = users[0]['last-name']

    request(app)
      .post(`${namespace}/users`)
      .send({ email, password, firstName, lastName })
      .expect(400)
      .end(done)
  })

  it('should return validation error if password is invalid', (done) => {
    let email = 'test@test@gmail.com',
        password = '123',
        firstName = 'Julian',
        lastName = users[0]['last-name']

    request(app)
      .post(`${namespace}/users`)
      .send({ email, password, firstName, lastName })
      .expect(400)
      .end(done)
  })

  it('should return validation error if firstName is invalid', (done) => {
    let email = 'test@test@gmail.com',
        password = '123123',
        firstName = '',
        lastName = users[0]['last-name']

    request(app)
      .post(`${namespace}/users`)
      .send({ email, password, firstName, lastName })
      .expect(400)
      .end(done)
  })

  it('should return validation error if lastName is invalid', (done) => {
    let email = 'test@test@gmail.com',
        password = '123123',
        firstName = 'Julian',
        lastName = ''

    request(app)
      .post(`${namespace}/users`)
      .send({ email, password, firstName, lastName })
      .expect(400)
      .end(done)
  })

  it('should not create user if email in use', (done) => {
    let email = users[0].email,
        password = '123123',
        firstName = 'Julian',
        lastName = users[0]['last-name']

    request(app)
      .post(`${namespace}/users`)
      .send({ email, password, firstName, lastName })
      .expect(400)
      .end(done)
  })
})


describe('PATCH /users/:id', () => {
    it('should update the user', (done) => {
      let id = users[0]._id.toHexString(),
          firstName = "Sammy"

      request(app)
        .patch(`${namespace}/users/${id}`)
        .set('content-type', 'application/vnd.api+json')
        .set('x-auth', users[0].tokens[0].token)
        .send({
          data: {
            attributes: {
              "first-name": firstName
            }
          }
        })
        .expect(200)
        .expect((res) => {
          const {
            data,
            data: { attributes }
          } = res.body

          expect(data.id).toBe(id)
          expect(attributes['first-name']).toBe(firstName)
        })
        .end(done)
    })
})


describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post(`${namespace}/users/login`)
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
      .post(`${namespace}/users/login`)
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
    .delete(`${namespace}/users/${users[0]._id.toHexString()}/token`)
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
