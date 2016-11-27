let xyz = require('xyz-core').xyz
let mathMS = new xyz({
  selfConf: {
    allowJoin: true,
    name: 'MathMS',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: {
    microservices: []
  }
})

mathMS.middlewares().transport.callDispatch.register(0, require('./auth.send'))
mathMS.middlewares().transport.callReceive.register(0, require('./auth.receive'))

mathMS.register('decimal/mul', (payload, response) => {
  response.send(payload.x * payload.y)
})

mathMS.register('decimal/add', (payload, response) => {
  response.send(payload.x + payload.y)
})

mathMS.register('float/mul', (payload, response) => {
  // let's add the float casting, just fore sake of our example!
  response.send(parseFloat(payload.x * payload.y))
})

mathMS.register('float/add', (payload, response) => {
  response.send(parseFloat(payload.x + payload.y))
})
