require('./config/environment')
require('./api/database')
require('colour')

const routes = require('./api/router'),
      _ = require('lodash'),
      express = require('express'),
      moment = require('moment'),
      cors = require('cors'),
      bodyParser = require('body-parser'),
      headers = ['x-auth'],
      corsOptions = { exposedHeaders: headers },
      namespace = '/api/v1',
      app = express()

app.options('*', cors()) // enable pre-flight request
app.use(cors(corsOptions)) // enable all cors requests
app.use(bodyParser.json()) // enable json parsing
app.use(namespace, routes);

if(!module.parent) {
  app.listen(process.env.PORT, () => {
    const name  = 'TodoAPI',
          environment  = process.env.NODE_ENV,
          host = process.env.HOST,
          port = process.env.PORT
    console.log(`
    \t\t\t\t\t ${moment().format('LLL')}\n
    ==============================================================\n
    ${name.green} started up in a ${environment.green} environment\n
    ==============================================================\n
    ${host}:${port}/${namespace} (ready for clients)
    \n`)
  })
}

module.exports = { app, headers, namespace }
