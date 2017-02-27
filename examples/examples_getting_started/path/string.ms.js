let XYZ = require('xyz-core')
let sendToAll = require('xyz.service.send.to.all')

let stringMS = new XYZ({
  selfConf: {
    defaultSendStrategy: sendToAll,
    name: 'stringMS',
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
  stringMS.call({servicePath: '/decimal/*', payload: {x: 2, y: 5}}, (err, body, res) => {
    if (err) throw err
    console.log(`my fellow service responded with ${JSON.stringify(body)}`)
  })
}, 2000)
