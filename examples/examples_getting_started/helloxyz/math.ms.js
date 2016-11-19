let xyz = require('xyz-core').xyz
let mathMS = new xyz({
  selfConf: {
    name: 'MathMS',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: {
    microservices: [{
      host: '127.0.0.1',
      port: 3334
    }]
  }
})

mathMS.register('mul', (payload, response) => {
  response.send(payload.x * payload.y)
})

mathMS.register('add', (payload, response) => {
  response.send(payload.x + payload.y)
})
