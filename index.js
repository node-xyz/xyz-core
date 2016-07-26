const ServiceRepository = require('./src/Service/ServiceRepository');
/*
Todo see if using stream instead of events is better
Todo Support local clustering[Must hack with it first]
Todo test log levels
 */

class NodeXYZ {
  constructor(selfName){
    this.name = selfName;
    this.serviceRepository = new ServiceRepository( selfName);
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
