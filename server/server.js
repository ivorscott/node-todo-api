// pull the mongoose property off the object
const {ObjectID} = require('mongodb'),
      {mongoose} = require('./db/mongoose'),
      {Todo} = require('./models/todo'),
      {User} = require('./models/user'),
      express = require('express'),
      bodyParser = require('body-parser'),
      port = process.env.PORT || 3000

let = app = express()
app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  let text = req.body.text,
      todo = new Todo({text})

  todo.save().then((doc) => {
    res.send(doc)
  },(e) => res.status(400).send(e))
})

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos})
  },(e) => res.status(400).send(e))
})

app.get('/todos/:id', (req, res) => {
  let id = req.params.id
  if(!ObjectID.isValid(id)) return res.status(404).send()

  Todo.findById(id).then((todo) => {
    if(!todo) return res.status(404).send()
    res.send({todo});
  }).catch((e) => res.status(400).send())
})

app.listen(port, () => {
  console.log(`Started up at ${port}`)
})

module.exports = {app}
