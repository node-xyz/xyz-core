var ms = require('./test/ms/MockMicroservice').MockMicroservice;
var fn = require('./test/ms/mockFunctions');
var snd = new ms('snd', 3334);
var rcv = new ms('rcv', 3333);

rcv.registerFn('mul', fn.mul);
rcv.registerFn('neg', fn.neg);
rcv.registerFn('up', fn.up);
rcv.registerFn('rev', fn.rev);
rcv.registerFn('finger', fn.finger);

snd.call('mul', {x:2, y:4}, (err, response) => {
  console.log(err, response);
});

snd.call('neg', true, (err, response) => {
  console.log(err, response);
});

snd.call('up', 'hello', (err, response) => {
  console.log(err, response);
});

snd.call('rev', [1,2,3], (err, response) => {
  console.log(err, response);
});

snd.call('finger', {hello: 'world'}, (err, response) => {
  console.log(err, response);
});


