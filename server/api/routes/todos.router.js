const express = require('express'),
      router = express.Router(),
      ctrlTodos = require('./../controllers/todos.controller'),
      { authenticate } = require('./../middleware/authenticate'),
      { deserialize } = require('./../middleware/deserialize'),
      { serialize } = require('./../middleware/serialize')

router
  .route('')
  .all(authenticate)
  .post(deserialize, ctrlTodos.todosAddOne, serialize)
  .get(ctrlTodos.todosGetAll, serialize)

router
  .route('/:id')
  .all(authenticate)
  .get(ctrlTodos.todosGetOne, serialize)
  .patch(deserialize, ctrlTodos.todosUpdateOne, serialize)
  .delete(ctrlTodos.todosDeleteOne, serialize)

module.exports = router;
