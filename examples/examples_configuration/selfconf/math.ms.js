let XYZ = require('./../../../index')
let mathMS = new XYZ({
  selfConf: {
    transport: [{type: 'HTTP', port: 4010}],
    name: 'from-self-conf'
  },
  systemConf: {nodes: []}
})

mathMS.register('mul', (payload, response) => {
  response.send(payload.x * payload.y)
})

mathMS.register('add', (payload, response) => {
  response.send(payload.x + payload.y)
})

console.log(mathMS)
