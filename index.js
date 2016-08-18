const ServiceRepository = require('./src/Service/service.repository');
let _CONFIG = require('./src/Config/config.global');
let _RSA = require('./src/Config/rsa.global')
let logger = require('./src/Log/Logger');
let argParser = require('./src/Util/commandline.parser');

/*
Todo see if using stream instead of events is better
Todo Support local clustering[Must hack with it first]
TODO add some sort of checking before waiting for body data
TODO integrate the flow of body/response/XResponse params on middlewares
TODO what happens when we early response using params[1].destory() but meanwhile call the next() ??
TODO start documention
TODO think about ways to remote deploy this ( +docker )
TODO implement any auth for call
TODO implement rsa auth for ping / call
TODO clean the cunstroctor and add a bootstrap()
 */


class NodeXYZ {
  constructor(configuration) {

    _CONFIG.setServiceConf(configuration.serviceConf);
    _CONFIG.setSystemConf(configuration.systemConf);

    global._serviceName = _CONFIG.getServiceConf().name

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

  bootstrap(configuration) {}

  emit(eventName, userPayload) {

  };

  middlewares() {
    return {
      transport: {
        server: {
          callReceive: this.serviceRepository.getTransportLayer().Server.callReceiveMiddlewareStack
        },
        client: {
          callDispatch: this.serviceRepository.getTransportLayer().Client.callDispatchMidllewareStack
        }
      },
      serviceRepository: {
        callDispatch: this.serviceRepository.callDispatchMiddlewareStack
      }
    }
  }
}

module.exports = NodeXYZ;
