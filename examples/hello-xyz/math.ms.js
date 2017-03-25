let XYZ = require('./../../index')
let fn = require('./../../test/ms/mock.functions')

var mathMs = new XYZ({
  selfConf: {
    name: 'math.ms',
    host: '127.0.0.1'
  },
  systemConf: {
    nodes: []
  }
})

mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)

setInterval(() => {
  mathMs.call({servicePath: '/string/up', payload: 'hello'}, (err, body, res) => {
    console.error('response of /string/up => ', err, body)
  })
}, 6000)

console.log(mathMs)
