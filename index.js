const ServiceRepository = require('./src/Service/ServiceRepository');
/*
Todo see if using stream instead of events is better
Todo Support local clustering[Must hack with it first]
Todo test log levels
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
}

module.exports = NodeXYZ;
