const common = require('../common');
const expect = common.expect;
const mockMicroservice = common.mockMicroService;
const mockSystem = common.mockSystem;
const mockFunctions = common.mockFunctions;
const http = require('http');

let snd;
let rcv;
let system;
let cwd;
before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'));
  system = new mockSystem(cwd);
  system.addMicroservice({host: "http://localhost", port: 3333});
  system.addMicroservice({host: "http://localhost", port: 3334});
  system.write();
  snd = new mockMicroservice('snd', 3334, cwd);
  rcv = new mockMicroservice('rcv', 3333, cwd);
  rcv.registerFn('mul', mockFunctions.mul);
  rcv.registerFn('up', mockFunctions.up);
  setTimeout( done , 500)
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
    expect(err).to.equal(http.STATUS_CODES[404]);
    expect(response).to.equal(null);
    done()
  })
});

after(function () {
  snd.stop();
  rcv.stop();
});
