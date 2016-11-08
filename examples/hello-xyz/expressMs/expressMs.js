var express = require('express')
var app = express()
var XYZ = require('./../../index')

var expressMs = new XYZ({
  selfConf: require('./express.json'),
  systemConf: require('./../xyz')
})

app.get('/', function (req, res) {
  expressMs.call('up', 'Hello World!', function (err, response) {
    res.send(response)
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
