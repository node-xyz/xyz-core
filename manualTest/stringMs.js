var fn = require('./../test/ms/mockFunctions');
var XYZ = require('./../index');

var stringMs = new XYZ('stringMs');

stringMs.register('down', fn.down);
stringMs.register('up', fn.up);
stringMs.register('finger', fn.finger);

setInterval( () => {
  stringMs.call('mul', {x: new Date().getTime(), y: new Date().getTime() }, (err, response) => {
    console.log(response);
  })
}, 100);