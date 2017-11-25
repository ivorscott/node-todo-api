// USERS ROUTER
//==============================================================================

const express = require('express'),
      router = express.Router(),
      ctrlUsers = require('./../controllers/users.controller'),
      authenticateUser = require('./../middleware/authenticate')

router
  .route('')
  .post(ctrlUsers.usersAddOne)

router
  .route('/login')
  .post(ctrlUsers.usersLogin)

router
  .route('/:id')
  .all(authenticateUser)
  .get(ctrlUsers.usersGetOne)
  .patch(ctrlUsers.usersUpdateOne)

router
  .route('/:id/token')
  .delete(authenticateUser, ctrlUsers.usersRemoveToken)

module.exports = router;
