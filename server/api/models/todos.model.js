const mongoose = require('mongoose'),
      { Schema } = mongoose

const TodoSchema = new Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true
  }
})

TodoSchema.statics.type = function() {
  return 'todos'
}

TodoSchema.statics.attributes = function() {
  return ['text', 'completed', 'completedAt', 'creator']
}

TodoSchema.methods.toJSON = function() {
  let Todo = this,
      todoObject = Todo.toObject(),
      attributes = TodoSchema.statics.attributes()
  return _.pick(todoObject, attributes)
}

const Todo = mongoose.model('Todo', TodoSchema)

module.exports = { Todo }
