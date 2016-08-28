var fn = require('./../../test/ms/mock.functions')
var XYZ = require('./../../index')

var stringMs = new XYZ({
  systemConf: require('./../xyz')
})

stringMs.register('down', fn.down)
stringMs.register('up', fn.up)
stringMs.register('finger', fn.finger)

setInterval(() => {
  stringMs.call('mul', { x: new Date().getTime(), y: new Date().getTime() }, (err, body, res) => {
    console.log('response of mul', body, res.statusCode)
  })

  stringMs.emit('_whassssaaaap', 'whassssaaaap')
}, 1000)
