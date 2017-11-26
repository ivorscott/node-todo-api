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
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

TodoSchema.statics.attributes = function() {
  return ['text', 'completed', 'completedAt', '_creator']
}

TodoSchema.methods.toJSON = function() {
  let Todo = this,
      todoObject = Todo.toObject(),
      attributes = this.attributes()
  return _.pick(todoObject, attributes)
}

const Todo = mongoose.model('Todo', TodoSchema)

module.exports = { Todo }
