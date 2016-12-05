var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index').xyz

var mathMs = new XYZ({
  selfConf: {
    defaultSendStrategy: require('xyz.service.send.to.all'),
    name: 'MathMs',
    host: '127.0.0.1',
    port: 3333
  },
  systemConf: { microservices: []}
})

mathMs.register('/math/decimal/mul', function (payload, response) {})
mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)

mathMs.register('/math/float/neg', function (payload, XResponse) {
  XResponse.send('ok whassssaaaap')
})
