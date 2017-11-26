const express = require('express'),
      router = express.Router(),
      ctrlTodos = require('./../controllers/todos.controller'),
      { authenticate } = require('./../middleware/authenticate')

router
  .route('')
  .all(authenticate)
  .post(ctrlTodos.todosAddOne)
  .get(ctrlTodos.todosGetAll)

router
  .route('/:id')
  .all(authenticate)
  .get(ctrlTodos.todosGetOne)
  .patch(ctrlTodos.todosUpdateOne)
  .delete(ctrlTodos.todosDeleteOne)

module.exports = router;
