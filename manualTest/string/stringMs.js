var fn = require('./../../test/ms/mockFunctions');
var XYZ = require('./../../index');


let serviceConfig = require('./stringMs.json');
let systemConfig = require('./../xyz');
var stringMs = new XYZ(serviceConfig, systemConfig);

stringMs.register('down', fn.down);
stringMs.register('up', fn.up);
stringMs.register('finger', fn.finger);

setInterval( () => {
  stringMs.call('mul', {x: new Date().getTime(), y: new Date().getTime() }, (err, response) => {
    console.log(err, response);
  })
}, 1000);