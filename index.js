const ServiceRepository = require('./src/Service/service.repository');
let _CONFIG = require('./src/Config/config.global');
let logger = require('./src/Log/Logger');

/*
Todo see if using stream instead of events is better
Todo Support local clustering[Must hack with it first]
TODO add some sort of checking before waiting for body data
TODO integrate the flow of body/response/XResponse params on middlewares
TODO what happens when we early response using params[1].end() but meanwhile call the next() ??

TODO clean the cunstroctor and add a bootstrap()
 */

class NodeXYZ {
  constructor(configuration) {
    global._serviceName = configuration.serviceConf.name; // JUST for log

    _CONFIG.setServiceConf(configuration.serviceConf);
    _CONFIG.setSystemConf(configuration.systemConf);

    this.serviceRepository = new ServiceRepository();

  }

  terminate() {
    this.serviceRepository.terminate();
  }

  register(serviceName, fn) {
    this.serviceRepository.register(serviceName, fn);
  };

  call(serviceName, userPayload, responseCallback) {
    this.serviceRepository.call(serviceName, userPayload, responseCallback)
  }

  middlewares() {
    return {
      transport: {
        server: {
          callReceive: this.serviceRepository.getTransportLayer().Server.callReceiveMiddleware
        }
      },
      serviceRepository: {
        callReceive: this.serviceRepository.callReceiveMiddleware
      }
    }
  }
}

module.exports = NodeXYZ;
