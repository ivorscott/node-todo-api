const express = require('express'),
      router = express.Router(),
      ctrlUsers = require('./../controllers/users.controller'),
      { authenticate } = require('./../middleware/authenticate')

router
  .route('')
  .post(ctrlUsers.usersAddOne)

router
  .route('/login')
  .post(ctrlUsers.usersLogin)

router
  .route('/:id')
  .all(authenticate)
  .get(ctrlUsers.usersGetOne)
  .patch(ctrlUsers.usersUpdateOne)

router
  .route('/:id/token')
  .delete(authenticate, ctrlUsers.usersRemoveToken)

module.exports = router;
