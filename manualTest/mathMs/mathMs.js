var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index')

var mathMs = new XYZ({
  serviceConf: require('./mathMs.json'),
  systemConf: require('./../xyz')
})

mathMs.register('decimal/mul', fn.mul)
mathMs.register('decimal/neg', fn.neg)
mathMs.register('float/neg', function (payload, XResponse) {
  XResponse.send('ok whassssaaaap')
})

setTimeout(function () {
  mathMs.call('hello', {}, (err, body, response) => {
    console.log('hello:')
    console.log(body)
  })

  mathMs.call('decimal/mul' , {x: 2,  y: 6}, (err, body, response) => {
    console.log('mul: ')
    console.log(body)
  })
}, 1000)
