var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index')

var mathMs = new XYZ({
  systemConf: require('./../xyz'),
  debug: true,
  loglevel: 'info'
})

mathMs.register('mul', fn.mul)
mathMs.register('neg', fn.neg)

mathMs.register('_whassssaaaap', function (payload, XResponse) {
  console.log(payload)
  XResponse.send('ok whassssaaaap')
})
