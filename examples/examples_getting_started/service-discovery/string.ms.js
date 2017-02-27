let XYZ = require('xyz-core')
let sendToAll = require('xyz.service.send.to.all')

let stringMS = new XYZ({
  selfConf: {
    name: 'stringMS',
    // defaultSendStrategy: sendToAll
    host: '127.0.0.1',
    port: 3334,
    seed: ['127.0.0.1:3333']
  },
  systemConf: {
    nodes: []
  }
})
stringMS.register('up', (payload, response) => {
  response.jsonify(payload.toUpperCase())
})
stringMS.register('down', (payload, response) => {
  response.jsonify(payload.toLowerCase())
})

setInterval(() => {
  stringMS.call({servicePath: 'mul', payload: {x: 2, y: 5}, sendStrategy: sendToAll}, (err, body, res) => {
    if (err) throw err
    console.log('my fellwo service reponded with')
    console.log(body)
  })
}, 2000)

console.log(stringMS)
