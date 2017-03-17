let XYZ = require('./../../index')
let math = new XYZ({})

// register a dummy service
math.register('add', (payload, resp) => {
  resp.jsonify(payload.x + payload.y)
})

math.register('math/mul', (payload, resp) => {
  resp.jsonify(payload.x * payload.y)
})

math.call({servicePath: '/math/*', payload: {x: 1, y: 7}}, (err, body) => {
  console.log(err, body)
})
