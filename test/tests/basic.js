const common = require('../common');
let expect = common.expect;
let mockMicroservice = common.mockMicroService;
let mockFunctions = common.mockFunctions;
const http = require('http');

let snd;
let rcv;
before(function () {
  snd = new mockMicroservice('snd', 3334);
  rcv = new mockMicroservice('rcv', 3333);
  rcv.registerFn('mul', mockFunctions.mul);
  rcv.registerFn('up', mockFunctions.up);
});

it("hello world", function (done) {
  snd.call('mul', {x: 2, y:3}, (err, response1) => {
    expect(response1).to.equal(6);
    snd.call('up', 'hello', (err, response2) => {
      expect(response2).to.equal('HELLO');
      done();
    });
  })

});

it("not found", function (done) {
  snd.call('mullll', {x: 2, y:3}, (err, response) => {
    expect(response).to.equal(http.STATUS_CODES[404]);
    done()
  })
});

after(function () {
  snd.stop();
  rcv.stop();
});
