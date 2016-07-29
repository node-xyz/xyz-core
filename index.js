const ServiceRepository = require('./src/Service/ServiceRepository');
/*
Todo see if using stream instead of events is better
Todo Support local clustering[Must hack with it first]
TODO add some sort of checking before waiting for body data
TODO integrate the flow of body/response/XResponse params on middlewares
TODO what happens when we early response using params[1].end() but meanwhile call the next() ??
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
