const XYZ = require('./../../index');
const fs = require('fs');
const logger =require('./../../src/Log/Logger');
/**
 * A Wrapper class around microservice interface
 */
class MockMicroservice {
  constructor(name, port, cwd) {
    let serviceConfiguration = {
      "name": name,
      "net": {
        "port": port
      }
    };

    fs.writeFileSync(`${cwd}/${name}.json`, JSON.stringify(serviceConfiguration));
    this.xyz = new XYZ(require(`./../tests/${name}.json`), require(`./../tests/xyzTest.json`));
  }

  registerFn(name, fn) {
    this.xyz.register(name, fn);
  }

  registerMiddleware(index, fn) {
    this.xyz.registerMiddleware(index, fn);
  }

  call(name, data, callback){
    this.xyz.call(name, data, callback);
  }

  stop() {
    logger.debug('service stopped');
    this.xyz.terminate();
  }
}

module.exports = {
  MockMicroservice: MockMicroservice
};