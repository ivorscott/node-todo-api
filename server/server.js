// pull the mongoose property off the object
const {mongoose} = require('./db/mongoose'),
      {Todo} = require('./models/todo'),
      {User} = require('./models/user'),
      express = require('express'),
      bodyParser = require('body-parser');

let app = express();

// Send JSON to our express application
app.use(bodyParser.json());

// POST Create a new todo
app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
      res.send(doc);
  }, (e) => {
      res.status(400).send(e);
  });
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    // pass the todos array as an object to, easily add properties later
    res.send({todos})
  },(e) => {
    res.status(400).send(e);
  })
});

app.listen(3000, () => {
  console.log('Shared on port 3000');
});

module.exports = {app};
