let XYZ = require('./../../index')
let fn = require('./../../test/ms/mock.functions')
let sendToAll = require('./../../built/Service/Middleware/service.send.to.all')

var mathMs = new XYZ({
  selfConf: {
    logLevel: 'verbose',
    name: 'math.mss',
    host: '127.0.0.1'
  },
  systemConf: {
    nodes: []
  }
})

mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)
mathMs.register('/math/*', (body, resp) => {
  console.log('loggggg', body)
})

setInterval(() => {
  mathMs.call({servicePath: '/string/up', payload: 'hello'}, (err, body, res) => {
    console.error('response of /string/up => ', err, body)
  })

  mathMs.call({servicePath: '/math/decimal/neg', payload: 2}, (err, body, res) => {
    console.error('response of /math/decimal/neg => ', err, body)
  })
}, 1000)

console.log(mathMs)
