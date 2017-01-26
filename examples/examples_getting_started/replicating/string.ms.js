let xyz = require('xyz-core')
let stringMS = new xyz({
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
stringMS.register('up', (payload, response) => {
  response.send(payload.toUpperCase())
})
stringMS.register('down', (payload, response) => {
  response.send(payload.toLowerCase())
})

setInterval(() => {
  stringMS.call({servicePath: 'mul', payload: {x: 2, y: 5}}, (err, body, res) => {
    console.log(`my fellwo service reponded with ${body}`)
  })
}, 2000)
