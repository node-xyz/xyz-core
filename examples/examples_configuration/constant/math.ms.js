let XYZ = require('xyz-core')
let mathMS = new XYZ({
  selfConf: {},
  systemConf: {nodes: []}
})

mathMS.register('mul', (payload, response) => {
  response.send(payload.x * payload.y)
})

mathMS.register('add', (payload, response) => {
  response.send(payload.x + payload.y)
})

console.log(mathMS)
