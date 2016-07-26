const ServiceRepository = require('./src/Service/ServiceRepository');
/*
Todo see if using stream instead of events is better
Todo move to typescript
Todo add Test Codes and separate folder
Todo find a network solution for easy dev
Todo all data types transferred transparently
Todo Support local clustering[Must hack with it first]
 */

class NodeXYZ {
  constructor(serviceName, devPort){
    this.name = serviceName;
    this.serviceRepository = new ServiceRepository(devPort);
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
