let xyz = require('xyz-core')
let mathMS = new xyz({
  selfConf: {
    allowJoin: true,
    name: 'MathMS',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: {
    nodes: []
  }
})

mathMS.register('mul', (payload, response) => {
  response.send(payload.x * payload.y)
})

mathMS.register('add', (payload, response) => {
  response.send(payload.x + payload.y)
})
