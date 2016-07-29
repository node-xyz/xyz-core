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
let str = 'manipulated';

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

  function manipulatorMiddleware(params, next, end) {
    params[2] = { userPayload : str };
    next(params)
  }

  rcv.registerMiddleware(0, manipulatorMiddleware);

  setTimeout( done , 500)
});

it("a new middleware a new day", function (done) {
  snd.call('up', 'hello', (err, response2) => {
    expect(response2).to.equal(str.toUpperCase());
    done();
  });

});

after(function () {
  snd.stop();
  rcv.stop();
});
