let xyz = require('xyz-core')
let sendToAll = require('xyz.service.send.to.all')

let stringMS = new xyz({
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
  response.send(payload.toUpperCase())
})
stringMS.register('down', (payload, response) => {
  response.send(payload.toLowerCase())
})

setInterval(() => {
  stringMS.call('/decimal/*', {x: 2, y: 5}, (err, body, res) => {
    console.log(`my fellow service responded with ${JSON.stringify(body)}`)
  })
}, 2000)
