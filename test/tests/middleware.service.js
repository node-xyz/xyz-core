const common = require('../common');
let logger = require('./../../src/Log/Logger');
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
  system.addMicroservice({
    host: "http://localhost",
    port: 3333
  });
  system.addMicroservice({
    host: "http://localhost",
    port: 3334
  });
  system.write();
  snd = new mockMicroservice('snd', 3334, cwd);
  rcv = new mockMicroservice('rcv', 3333, cwd);
  rcv.registerFn('mul', mockFunctions.mul);
  rcv.registerFn('up', mockFunctions.up);

  setTimeout(done, 500)
});


it('False servicrDiscovery', function (done) {
  function wrongServicediscoveryMiddleware(params, next, end) {
    let serviceName = params[0],
      userPayload = params[1],
      foreignServices = params[2],
      transportClient = params[3]
    responseCallback = params[4];

    for (let node in foreignServices) {
      let index = foreignServices[node].indexOf(serviceName);
      if (index === -1) {
        logger.info(`WRONG DISCOVERY :: determined ${node} for ${serviceName}`);
        let config = { serviceName: serviceName, uri: node };
        transportClient.send(config, userPayload, (err, responseData) => {
          responseCallback(err, responseData);
        });
        return
      }
    }
    responseCallback(http.STATUS_CODES[404], null)
  }

  snd.middlewares().serviceRepository.callReceive.remove(-1);
  snd.middlewares().serviceRepository.callReceive.register(-1, wrongServicediscoveryMiddleware);
  snd.call('up', 'what the hell', (err, response) => {
    expect(response).to.equal(http.STATUS_CODES[404]);
    snd.middlewares().serviceRepository.callReceive.remove(0);
    snd.middlewares().serviceRepository.callReceive.register(-1, require('./../../src/Service/Middlewares/call.middleware.first.find'))
    done()
  })


})

it('changeMiddlewareOnTheFly - Hot Swap', function (done) {
  function wrongServicediscoveryMiddleware(params, next, end) {
    let serviceName = params[0],
      userPayload = params[1],
      foreignServices = params[2],
      transportClient = params[3]
    responseCallback = params[4];

    for (let node in foreignServices) {
      let index = foreignServices[node].indexOf(serviceName);
      if (index === -1) {
        logger.info(`WRONG DISCOVERY :: determined ${node} for ${serviceName}`);
        let config = { serviceName: serviceName, uri: node };
        transportClient.send(config, userPayload, (err, responseData) => {
          responseCallback(err, responseData);
        });
        return
      }
    }
    responseCallback(http.STATUS_CODES[404], null)
  }

  snd.call('up', 'will be ok', (err, response) => {
    expect(response).to.equal('WILL BE OK');
    snd.middlewares().serviceRepository.callReceive.remove(-1);
    snd.middlewares().serviceRepository.callReceive.register(-1, wrongServicediscoveryMiddleware);
    snd.call('up', 'will be not OK', (err, response) => {
      expect(response).to.equal(http.STATUS_CODES[404]);
      snd.middlewares().serviceRepository.callReceive.remove(0);
      done()
    })
  })
})

after(function () {
  snd.stop();
  rcv.stop();
});
