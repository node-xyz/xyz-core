var express = require('express')
var app = express()
var XYZ = require('./../../../index')

var expressMs = new XYZ({
  selfConf: {
    seed: [
      {
        host: '127.0.0.1',
        port: 3333
      }
    ],
    name: 'expressMs',
    host: '127.0.0.1',
    port: 6000
  },
  systemConf: {
    microservices: []
  }
})

app.get('/', function (req, res) {
  expressMs.call('up', 'Hello World!', function (err, response) {
    res.send(response)
  })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
