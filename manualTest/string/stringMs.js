var fn = require('./../../test/ms/mock.functions');
var XYZ = require('./../../index');

var stringMs = new XYZ({
  serviceConf: require('./stringMs.json'),
  systemConf: require('./../xyz')
});

stringMs.register('down', fn.down);
stringMs.register('up', fn.up);
stringMs.register('finger', fn.finger);

setInterval(() => {
  stringMs.call('mul', { x: new Date().getTime(), y: new Date().getTime() }, (err, response, body) => {
    console.log(err, body);
  })
}, 1000);
