var XYZ = require('./../../index');

/**
 * A Wrapper class around microservice interface
 */
class MockMicroservice {
  constructor(name, port) {
    this.xyz = new XYZ(name, port);
  }

  registerFn(name, fn) {
    this.xyz.register(name, fn);
  }

  call(name, data, callback){
    this.xyz.call(name, data, callback);
  }

  stop() {
    this.xyz.terminate();
  }
}

module.exports = {
  MockMicroservice: MockMicroservice
};