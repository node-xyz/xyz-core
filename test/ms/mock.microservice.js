const XYZ = require('./../../index');
const fs = require('fs');
const logger = require('./../../src/Log/Logger');
/**
 * A Wrapper class around microservice interface
 */
class MockMicroservice {
  constructor(name, port, cwd) {
    let serviceConfiguration = {
      "name": name,
      "host": "http://localhost",
      "port": port
    };

    fs.writeFileSync(`${cwd}/${name}.json`, JSON.stringify(serviceConfiguration));
    this.xyz = new XYZ({
      serviceConf: require(`./../tests/${name}.json`),
      systemConf: require(`./../tests/xyzTest.json`)
    });
  }

  registerFn(name, fn) {
    this.xyz.register(name, fn);
  }

  call(name, data, callback) {
    this.xyz.call(name, data, callback);
  }

  middlewares() {
    return this.xyz.middlewares()
  }

  stop() {
    logger.debug('service stopped');
    this.xyz.terminate();
  }
}

module.exports = {
  MockMicroservice: MockMicroservice
};
