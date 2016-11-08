var fn = require('./../../../test/ms/mock.functions')
var XYZ = require('./../../../index')

var stringMs = new XYZ({
  serviceConf: require('./stringMs.json'),
  systemConf: require('./../xyz')
})

stringMs.register('/string/down', fn.down)
stringMs.register('/string/up', fn.up)
stringMs.register('/finger', fn.finger)

setInterval(() => {
  stringMs.call('/math/decimal/*', { x: new Date().getTime(), y: new Date().getTime() }, (err, body, res) => {
    console.log('response of decimal/*', body)
  })
}, 1000)
