var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index')
let sendToAll = require('xyz.service.send.to.all')

var stringMs = new XYZ({
  selfConf: {
    name: 'string.ms',
    logLevel: 'verbose',
    host: '127.0.0.1',
    seed: ['127.0.0.1:4000', '127.0.0.1:7000', '127.0.0.1:8000'],
    transport: [{type: 'HTTP', port: 5000}],
    defaultBootstrap: false
  },
  systemConf: {nodes: []}
})

stringMs.bootstrap(require('./../../../xyz.ping.stochastic.bootstrap/ping.stochastic'), true, stringMs.CONFIG.getSelfConf().transport[0].port)

stringMs.register('/string/down', fn.down)
stringMs.register('/string/up', fn.up)
stringMs.register('/finger', fn.finger)

stringMs.registerClientRoute('foo')

setInterval(() => {
  stringMs.call({
    servicePath: '/math/decimal/*',
    payload: { x: 1000000, y: new Date().getTime() },
    sendStrategy: sendToAll}, (err, body, res) => {
    if (err) throw err
    console.error('response of /math/decimal/* => ', err, body)
  })
}, 1000)

console.log(stringMs)
