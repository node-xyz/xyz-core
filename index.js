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
  constructor(name, devPort){
    this.name = name;
    this.serviceRepository = new ServiceRepository(devPort);
  }

  register(name , fn){
    this.serviceRepository.register(name, fn);
  };

  call(name, data, responseCallback){
    this.serviceRepository.call(name, data, responseCallback)
  }
}

module.exports = NodeXYZ;
