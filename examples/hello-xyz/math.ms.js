let fn = require('./../../test/ms/mock.functions')
let XYZ = require('./../../index').xyz
let defaultPingBootstra = require('./../../src/Bootstrap/ping.default')
let clusterListenerBootstrap = require('./../../src/Bootstrap/clsuter.listener')

var mathMs = new XYZ({
  selfConf: {
    // allowJoin: true,
    name: 'MathMs',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: { nodes: []}
})

clusterListenerBootstrap(mathMs)

mathMs.register('/math/decimal/mul', fn.mul)
mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)

mathMs.register('/math/float/neg', function (payload, XResponse) {
  XResponse.send('ok whassssaaaap')
})
