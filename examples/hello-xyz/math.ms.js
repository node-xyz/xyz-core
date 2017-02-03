let XYZ = require('./../../index')
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

mathMs.register('/math/decimal/mul', (payload, response) => {
  console.log(payload)
  response.send('ok', 201)
})
mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)

mathMs.register('/math/float/neg', function (payload, XResponse) {
  XResponse.send('ok whassssaaaap')
})

mathMs.registerServerRoute('foo')

console.log(mathMs)
