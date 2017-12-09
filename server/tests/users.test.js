const _ = require('lodash'),
      expect = require('expect'),
      { app, namespace } = require('./../server'),
      request = require('supertest'),
      { ObjectID } = require('mongodb'),
      { User } = require('./../api/models/users.model'),
      { users, populateUsers, sampleAttributes } = require('./seed/seed')

beforeEach(populateUsers)

describe('GET /users/:id', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get(`${namespace}/users/${users[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        const {
          data
        } = res.body

        expect(data.id).toBe(users[0]._id.toHexString())
        expect(data.attributes.email).toBe(users[0].email)
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
    let attributes = _.clone(sampleAttributes)
    let { email, password } = attributes

    request(app)
      .post(`${namespace}/users`)
      .set('content-type', 'application/vnd.api+json')
      .send({
        data: { attributes }
      })
      .expect(200)
      .expect((res) => {
        const {
          data
        } = res.body

        expect(res.headers['x-auth']).toExist()
        expect(data.id).toExist()
        expect(data.attributes.email).toBe(email);
        expect(data.attributes['last-name']).toBe(attributes['last-name']);
        expect(data.attributes['first-name']).toBe(attributes['first-name']);
      })
      .end((err) => {
        if(err) return done(err)
        User.findOne({email}).then((user) => {
          expect(user.password).toNotBe(password)
          done()
        }).catch((e) => done(e))
      })
  })

  it('should return validation error if email is invalid', (done) => {
    let attributes = _.clone(sampleAttributes)
    attributes.email = '123'

    request(app)
      .post(`${namespace}/users`)
      .send({
        data: { attributes }
      })
      .expect(400)
      .end(done)
  })

  it('should return validation error if password is invalid', (done) => {
    let attributes = _.clone(sampleAttributes)
    attributes.password = '123'

    request(app)
      .post(`${namespace}/users`)
      .send({
        data: { attributes }
      })
      .expect(400)
      .end(done)
  })

  it('should return validation error if firstName is invalid', (done) => {
    let attributes = _.clone(sampleAttributes)
    attributes['firstName'] = ''

    request(app)
      .post(`${namespace}/users`)
      .send({
        data: { attributes }
      })
      .expect(400)
      .end(done)
  })

  it('should return validation error if lastName is invalid', (done) => {
    let attributes = _.clone(sampleAttributes)

    attributes['last-name'] = ''

    request(app)
      .post(`${namespace}/users`)
      .send({ data: { attributes } })
      .expect(400)
      .end(done)
  })

  it('should not create user if email in use', (done) => {
    let attributes = _.clone(sampleAttributes)
    attributes.email = users[0].email

    request(app)
      .post(`${namespace}/users`)
      .send({ data: { attributes } })
      .expect(400)
      .end(done)
  })
})

describe('PATCH /users/:id', () => {
  it('should update the user', (done) => {
    let id = users[0]._id.toHexString()
    let attributes = _.clone(sampleAttributes)
    attributes['first-name'] = "Sammy"

    request(app)
      .patch(`${namespace}/users/${id}`)
      .set('content-type', 'application/vnd.api+json')
      .set('x-auth', users[0].tokens[0].token)
      .send({ data: { attributes } })
      .expect(200)
      .expect((res) => {
        const {
          data
        } = res.body

        expect(data.id).toBe(id)
        expect(data.attributes['first-name']).toBe(attributes['first-name'])
      })
      .end(done)
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    let attributes = sampleAttributes
    attributes.email = users[1].email
    attributes.password = users[1].password

    request(app)
      .post(`${namespace}/users/login`)
      .set('content-type', 'application/vnd.api+json')
      .send({
        data: { attributes }
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
    let attributes = sampleAttributes
    attributes.email = users[1].email
    attributes.password = users[1].password + '1'

    request(app)
      .post(`${namespace}/users/login`)
      .send({
        data: { attributes }
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
