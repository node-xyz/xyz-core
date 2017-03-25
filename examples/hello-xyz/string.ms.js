var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index')

var stringMs = new XYZ({
  selfConf: {
    name: 'string.ms',
    logLevel: 'verbose',
    host: '127.0.0.1',
    seed: ['127.0.0.1:4000'],
    transport: [{type: 'HTTP', port: 5000}]
  },
  systemConf: {nodes: []}
})

stringMs.register('/string/down', fn.down)
stringMs.register('/string/up', fn.up)
stringMs.register('/finger', fn.finger)

console.log(stringMs)
