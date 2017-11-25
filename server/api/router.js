// API ROUTER
//==============================================================================
const express = require('express'),
      router = express.Router(),
      // routeTodos = require('./routes/todos.router'),
      routeUsers = require('./routes/users.router')

// USER ROUTES
//==============================================================================

// router.use('/todos', routeTodos)
router.use('/users', routeUsers)

module.exports = router;
