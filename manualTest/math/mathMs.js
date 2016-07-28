var fn = require('./../../test/ms/mockFunctions');
var XYZ = require('./../../index');


let serviceConfig = require('./mathMs.json');
let systemConfig = require('./../xyz');
var mathMs = new XYZ(serviceConfig, systemConfig);

mathMs.register('mul', fn.mul);
mathMs.register('neg', fn.neg);