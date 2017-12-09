const JSONAPISerializer = require('jsonapi-serializer').Serializer

let serialize = (req, res) => {
  let jsonAPI = new JSONAPISerializer(req.type, {
     attributes: req.attributes
  }).serialize(req.data);
  res.send(jsonAPI)
}

module.exports = { serialize }
