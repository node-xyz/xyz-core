var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index')
let sendToAll = require('xyz.service.send.to.all')

var stringMs = new XYZ({
  selfConf: {
    logLevel: 'verbose',
    seed: ['127.0.0.1:3333'],
    name: 'stringMs',
    host: '127.0.0.1',
    port: 3334,
    defaultBootstrap: false
  },
  systemConf: {
    nodes: []
  }
})

stringMs.bootstrap(require('./../../../xyz.ping.stochastic.bootstrap/ping.stochastic'), true)

stringMs.register('/string/down', fn.down)
stringMs.register('/string/up', fn.up)
stringMs.register('/finger', fn.finger)

setInterval(() => {
  stringMs.call({servicePath: '/math/decimal/*', payload: { x: 1000000, y: new Date().getTime() }}, (err, body, res) => {
    console.error('response of decimal/* => ', err, body)
    if (res) { console.log(res.statusCode) }
  })
}, 3000)

console.log(stringMs)
