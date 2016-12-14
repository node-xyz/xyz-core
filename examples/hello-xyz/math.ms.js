var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index').xyz

var mathMs = new XYZ({
  selfConf: {
    // allowJoin: true,
    name: 'MathMs',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: { nodes: []}
})

mathMs.register('/math/decimal/mul', fn.mul)
mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)

mathMs.register('/math/float/neg', function (payload, XResponse) {
  XResponse.send('ok whassssaaaap')
})
