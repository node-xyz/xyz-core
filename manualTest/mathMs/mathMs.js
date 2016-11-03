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
  mathMs.call('hello', (response) => {
    console.log(response)
  })

  mathMs.call('decimal/mul', (response) => {
    console.log(response)
  })
}, 1000)
