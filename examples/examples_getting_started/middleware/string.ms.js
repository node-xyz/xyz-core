let XYZ = require('xyz-core')
let sendToAll = require('xyz.service.send.to.all')

let stringMS = new XYZ({
  defaultSendStrategy: sendToAll,
  selfConf: {
    name: 'stringMS',
    host: '127.0.0.1',
    port: 3334,
    seed: ['127.0.0.1:3333']
  },
  systemConf: {
    nodes: []
  }
})

stringMS.middlewares().transport.client('CALL').register(0, require('./auth.send'))
stringMS.middlewares().transport.server('CALL').register(0, require('./auth.receive'))

// stringMS.middlewares().transport.client('CALL').register(0, require('./dummy.logger'))

stringMS.register('up', (payload, response) => {
  response.jsonify(payload.toUpperCase())
})
stringMS.register('down', (payload, response) => {
  response.jsonify(payload.toLowerCase())
})

setInterval(() => {
  stringMS.call({servicePath: '/*/mul', payload: {x: 2, y: 5}}, (err, body, res) => {
    if (err) throw err
    console.log(`my fellow service responded with ${JSON.stringify(body)}`)
  })
}, 2000)

console.log(stringMS)
