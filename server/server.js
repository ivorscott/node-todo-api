require('./config/environment')
require('./api/database')

const routes = require('./api/router'),
      _ = require('lodash'),
      express = require('express'),
      cors = require('cors'),
      bodyParser = require('body-parser'),
      headers = ['x-auth'],
      corsOptions = { exposedHeaders: headers },
      app = express()

app.options('*', cors()) // enable pre-flight request
app.use(cors(corsOptions)) // enable all cors requests
app.use(bodyParser.json()) // enable json parsing

app.use('/api/v1', routes);

if(!module.parent) {
  app.listen(process.env.PORT, () => console.log(`
    NODE_ENV ${process.env.NODE_ENV} Started up at ${process.env.PORT}`))
}

module.exports = { app, headers }
