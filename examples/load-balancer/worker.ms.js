var XYZ = require('./../../index')
let sendToAll = require('xyz.service.send.to.all')
const fs = require('fs')
let worker = new XYZ({
  selfConf: {name: 'worker.ms', transport: [{type: 'HTTP', port: 3000}]},
  systemConf: {nodes: ['127.0.0.1:5000']}
})

worker.register('/task/cpu', (payload, response) => {
  let num = 1
  for (let i = 1; i < 100; i++) {
    num = num * i
  }
  response.jsonify(num)
})

worker.register('/task/io', (payload, response) => {
  const MAX = 1000
  for (let i = 0; i <= MAX; i++) {
    fs.writeFile('./trash.txt', String(i), function (_i, err) {
      if (err) throw err
      else {
        if (_i === MAX) {
          response.jsonify('written')
        }
      }
    }.bind(null, i))
  }
})

console.log(worker)
