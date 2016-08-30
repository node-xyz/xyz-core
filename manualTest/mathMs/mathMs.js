var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index')

var mathMs = new XYZ({
  serviceConf: require('./mathMs.json'),
  systemConf: require('./../xyz')
})

mathMs.register('mul', fn.mul)
mathMs.register('neg', fn.neg)

mathMs.register('_whassssaaaap', function (payload, XResponse) {
  console.log(payload)
  XResponse.send('ok whassssaaaap')
})
