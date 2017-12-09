const _ = require('lodash'),
      JSONAPIDeserializer = require('jsonapi-serializer').Deserializer

let deserialize = (req, res, next) => {
  let payload = req.body.data,
      helpLink = '=> http://jsonapi.org';

  if (!payload) {
    return res.status(400).send({
      error: `expected a payload in jsonapi format ${helpLink}`
    })
  }

  if (!payload.attributes) {
    return res.status(400).send({ error: `expected data.attributes ${helpLink}`
    })
  }

  if (_.isEmpty(payload.attributes)) {
    return res.status(400).send({
      error: `expected attributes object to have properties ${helpLink}`
    })
  }

  new JSONAPIDeserializer().deserialize(req.body, (err, data) => {
      req.data = data
      next()
  });
}

module.exports = { deserialize }
