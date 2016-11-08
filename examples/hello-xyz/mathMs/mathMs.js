var fn = require('./../../../test/ms/mock.functions')
var XYZ = require('./../../../index')

var mathMs = new XYZ({
  serviceConf: require('./mathMs.json'),
  systemConf: require('./../xyz')
})

mathMs.register('/math/decimal/mul', fn.mul)
mathMs.register('/math/decimal/neg', fn.neg)
mathMs.register('/math/decimal/sub', fn.sub)

mathMs.register('/float/neg', function (payload, XResponse) {
  XResponse.send('ok whassssaaaap')
})

// setTimeout(function () {
//   mathMs.call('hello', {}, (err, body, response) => {
//     console.log('hello:')
//     console.log(body)
//   })
//
//   mathMs.call('decimal/mul' , {x: 2,  y: 6}, (err, body, response) => {
//     console.log('mul: ')
//     console.log(err, body)
//   })
// }, 1000)
