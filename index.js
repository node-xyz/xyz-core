const ServiceRepository = require('./src/Service/ServiceRepository');
/*
Todo see if using stream instead of events is better
Todo Support local clustering[Must hack with it first]
TOdo Separate HTTP Server and Client
TODO Test Middleware End Command
 */

class NodeXYZ {
  constructor(serviceConf, systemConf){

    this.serviceRepository = new ServiceRepository(serviceConf, systemConf);
  }

  terminate(){
    this.serviceRepository.terminate();
  }

  register(serviceName , fn){
    this.serviceRepository.register(serviceName, fn);
  };

  call(serviceName, userPayload, responseCallback){
    this.serviceRepository.call(serviceName, userPayload, responseCallback)
  }

  registerMiddleware(index, fn) {
    this.serviceRepository.getTransportLayer().Server.publicMiddlewareHandler.register(index, fn);
  }

  getMiddlewares(){
    this.serviceRepository.getTransportLayer().getMiddlewares();
  }
}

module.exports = NodeXYZ;
