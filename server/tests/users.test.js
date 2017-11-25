const expect = require('expect'),
      { app, headers } = require('./../server'),
      request = require('supertest'),
      { ObjectID } = require('mongodb'),
      { Todo } = require('./../models/todo'),
      { User } = require('./../models/user'),
      { todos, users, populateTodos , populateUsers } = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('GET /users/:id', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get(`/users/${users[0]._id.toHexString()}`)
      .set(headers[0], users[0].tokens[0].token)
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
      .get(`/users/${users[0]._id.toHexString()}`)
      .set(headers[0], '')
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
        const {
          data,
          data: { attributes }
        } = res.body

        expect(res.headers[headers[0]]).toExist()
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


describe('PATCH /users/:id', () => {
    it('should update the user', (done) => {
      let id = users[0]._id.toHexString(),
          firstName= "Sammy"

      request(app)
        .patch(`/users/${id}`)
        .set(headers[0], users[0].tokens[0].token)
        .send({firstName})
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
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers[headers[0]]).toExist()
      })
      .end((err, res) => {
        if(err) return done(err)

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers[headers[0]]
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
        expect(res.headers[headers[0]]).toNotExist()
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
    .set(headers[0], users[0].tokens[0].token)
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
