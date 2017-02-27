let XYZ = require('./../../index')
let fn = require('./../../test/ms/mock.functions')

var mathMs = new XYZ({
  selfConf: {
    name: 'MathMs',
    host: '127.0.0.1',
    transport: [{type: 'HTTP', port: 5000}, {type: 'UDP', port: 6000}]
    // defaultBootstrap: false
  },
  systemConf: {nodes: []}
})

mathMs.serviceRepository.transport.registerServer(6000, 'UDP')
mathMs.registerServerRoute(6000, 'UDP')
mathMs.middlewares().transport.server('UDP')(6000).register(0, require('./../../src/Transport/Middlewares/call/udp.receive.event'))
mathMs.register('/math/decimal/mul', (payload, response) => {
  response.jsonify('ok')
})
mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)

mathMs.register('/math/float/neg', function (payload, XResponse) {
  XResponse.jsonify('ok whassssaaaap')
})

console.log(mathMs)
