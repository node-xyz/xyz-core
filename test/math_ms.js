var XYZ = require('./../index');

var mathMicroService = new XYZ('math', 3334);

function mul(x, y) {
  return x*y
}

function add(x, y) {
  return x+y
}

mathMicroService.call('up', 'hello', function (err, data) {
  // TODO this should be more transparent
  console.log(`yoooohooo ${err} , ${data.body}`);
});

