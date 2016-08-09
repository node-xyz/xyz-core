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
        transportClient.send(config, userPayload, (err, response, body) => {
          responseCallback(err, response, body);
        });
        return
      }
    }
    responseCallback(http.STATUS_CODES[404], null, null)
  }

  snd.middlewares().serviceRepository.callDispatch.remove(-1);
  snd.middlewares().serviceRepository.callDispatch.register(-1, wrongServicediscoveryMiddleware);
  snd.call('up', 'what the hell', (err, response, body) => {
    //this is exacly end of request event on serviceRepository
    expect(response.statusCode).to.equal(404);
    expect(body).to.equal(http.STATUS_CODES[404]);
    snd.middlewares().serviceRepository.callDispatch.remove(0);
    snd.middlewares().serviceRepository.callDispatch.register(-1, require('./../../src/Service/Middlewares/call.middleware.first.find'))
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
        transportClient.send(config, userPayload, (err, response, body) => {
          responseCallback(err, response, body);
        });
        return
      }
    }
    responseCallback(http.STATUS_CODES[404], null)
  }

  snd.call('up', 'will be ok', (err, response, body) => {
    expect(body).to.equal('WILL BE OK');
    snd.middlewares().serviceRepository.callDispatch.remove(-1);
    snd.middlewares().serviceRepository.callDispatch.register(-1, wrongServicediscoveryMiddleware);
    snd.call('up', 'will be not OK', (err, response, body) => {
      expect(body).to.equal(http.STATUS_CODES[404]);
      snd.middlewares().serviceRepository.callDispatch.remove(0);
      done()
    })
  })
})

after(function () {
  snd.stop();
  rcv.stop();
});
