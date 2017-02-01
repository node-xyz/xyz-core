let XYZ = require('./../../index')
let clusterListenerBootstrap = require('./../../src/Bootstrap/clsuter.listener')
let fn = require('./../../test/ms/mock.functions')

var mathMs = new XYZ({
  selfConf: {
    allowJoin: true,
    name: 'MathMs',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: { nodes: []}
})

// clusterListenerBootstrap(mathMs)

mathMs.register('/math/decimal/mul', (payload, response) => {
  console.log(payload)
  response.send('ok', 201)
})
mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)

mathMs.register('/math/float/neg', function (payload, XResponse) {
  XResponse.send('ok whassssaaaap')
})

console.log(mathMs)
