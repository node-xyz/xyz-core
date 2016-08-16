var fn = require('./../../test/ms/mock.functions');
var XYZ = require('./../../index');

var mathMs = new XYZ({
  serviceConf: require('./mathMs.json'),
  systemConf: require('./../xyz'),
  debug: true,
  loglevel: 'info'
});

mathMs.register('mul', fn.mul);
mathMs.register('neg', fn.neg);
