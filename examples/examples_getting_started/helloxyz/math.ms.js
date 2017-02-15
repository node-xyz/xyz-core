let xyz = require('xyz-core')

let mathMS = new xyz({
  selfConf: {
    name: 'MathMS',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: {
    nodes: ['127.0.0.1:3334']
  }
})

mathMS.register('mul', (payload, response) => {
  response.jsonify(payload.x * payload.y)
})

mathMS.register('add', (payload, response) => {
  response.jsonify(payload.x + payload.y)
})
