const express = require('express'),
      router = express.Router(),
      ctrlTodos = require('./../controllers/todos.controller'),
      { authenticate } = require('./../middleware/authenticate')

router
  .route('')
  .post(ctrlTodos.todosAddOne)

router
  .route('/:id')
  .all(authenticate)
  .get(ctrlTodos.todosGetOne)
  .patch(ctrlTodos.todosUpdateOne)
  .delete(ctrlTodos.todosDeleteOne)

module.exports = router;
