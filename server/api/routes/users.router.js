const express = require('express'),
      router = express.Router(),
      ctrlUsers = require('./../controllers/users.controller'),
      { authenticate } = require('./../middleware/authenticate'),
      { deserialize } = require('./../middleware/deserialize'),
      { serialize } = require('./../middleware/serialize')

router
  .route('')
  .post(deserialize, ctrlUsers.usersAddOne)

router
  .route('/login')
  .post(deserialize, ctrlUsers.usersLogin)

router
  .route('/:id')
  .all(authenticate)
  .get(ctrlUsers.usersGetOne)
  .patch(deserialize, ctrlUsers.usersUpdateOne, serialize)

router
  .route('/:id/token')
  .delete(authenticate, ctrlUsers.usersRemoveToken)

module.exports = router;
