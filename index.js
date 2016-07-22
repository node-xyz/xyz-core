const ServiceRepository = require('./src/Service/ServiceRepository');

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
