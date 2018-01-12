# node-todo-api

[nodo-todo-api](https://github.com/ivorscott/node-todo-api) is a NodeJS Express API that utilizes MongoDB & the Mocha testing framework.
This api serializes & deserializes [jsonapi](http://jsonapi.org) payloads and is designed to work with [ember-todo-app](https://github.com/ivorscott/ember-todo-app).


## Configuration

The api requires [MongoDB](https://www.mongodb.com) to be install locally and [nodemon](https://github.com/remy/nodemon) for a better development experience. Addtionally [Postman](https://www.getpostman.com) and [Robo3T](https://robomongo.org/) (previously RoboMongo) are essential tools I used throughout the development.

Copy and paste this example config file. Then change the `JWT_SECRET` strings for both test and development.

```javascript
// file: nodo-todo-api/server/config/config.json

{
  "test": {
    "MONGODB_URI": "mongodb://localhost:27017/TodoTestApi",
    "HOST": "http://localhost",
    "PORT": 3000,
    "JWT_SECRET": "Some-Secret-Dont-Tell-Anyone"
  },
  "development": {
    "MONGODB_URI": "mongodb://localhost:27017/TodoApi",
    "HOST": "http://localhost",
    "PORT": 4000,
    "JWT_SECRET": "Top-Secret-Dont-Tell-Anyone"
  }
}
```

### Create a User
Create a user or two in Postman.

`POST`

Set Header
  `Content-Type: application/vnd.api+json`

Send raw text to http://localhost:4000/api/v1/users

```json
{
  "data": {
    "attributes": {
      "firstName": "Rob",
      "lastName": "Smith",
      "email":"test@test.com",
      "password":"test123"
    }
  }
}
```

**Please Note :**

 `POST /users` and `POST /users/login` endpoints are the only endpoints that return an `x-auth` authentication token which can be found in the response headers after the request.

 With this new user you can now login to  [ember-todo-app](https://github.com/ivorscott/ember-todo-app). Run this project against node-todo-api.

#### Usage
```javascript
npm install -g nodemon
npm install
npm start // api runs on port :4000
```

In a separate window do

```javascript
npm test //or
npm test-watch
```
