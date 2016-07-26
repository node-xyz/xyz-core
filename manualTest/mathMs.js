var fn = require('./../test/ms/mockFunctions');
var XYZ = require('./../index');

var mathMs = new XYZ('mathMs');

mathMs.register('mul', fn.mul);
mathMs.register('neg', fn.neg);