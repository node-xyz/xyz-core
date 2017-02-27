let XYZ = require('xyz-core')
let mathMS = new XYZ({
  selfConf: {
    name: 'MathMS',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: {
    nodes: []
  }
})

mathMS.middlewares().transport.client('CALL').register(0, require('./auth.send'))
mathMS.middlewares().transport.server('CALL').register(0, require('./auth.receive'))

// mathMS.middlewares().transport.server('CALL').register(0, require('./dummy.logger'))

mathMS.register('decimal/mul', (payload, response) => {
  response.jsonify(payload.x * payload.y)
})

mathMS.register('decimal/add', (payload, response) => {
  response.jsonify(payload.x + payload.y)
})

mathMS.register('float/mul', (payload, response) => {
  // let's add the float casting, just fore sake of our example!
  response.jsonify(parseFloat(payload.x * payload.y))
})

mathMS.register('float/add', (payload, response) => {
  response.jsonify(parseFloat(payload.x + payload.y))
})

console.log(mathMS)
