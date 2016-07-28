var XYZ = require('./../../index');
var fs = require('fs');

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