const XYZ = require('./../../index').xyz
const fs = require('fs')
const logger = require('./../../index').logger
/**
 * A Wrapper class around microservice interface
 */
class MockMicroservice {
  constructor (name, port, cwd) {
    let selfConfiguration = {
      'logLevel': 'debug',
      'name': name,
      'host': 'localhost',
      'port': port
    }

    fs.writeFileSync(`${cwd}/${name}.json`, JSON.stringify(selfConfiguration))
    this.xyz = new XYZ({
      selfConf: require(`./../tests/${name}.json`),
      systemConf: require(`./../tests/xyzTest.json`)
    })

  // all tests will be with first find by default.
  }

  register (name, fn) {
    this.xyz.register(name, fn)
  }

  call (name, data, callback) {
    this.xyz.call(name, data, callback)
  }

  middlewares () {
    return this.xyz.middlewares()
  }

  stop () {
    logger.debug('service stopped')
    this.xyz.terminate()
  }
}

module.exports = {
  MockMicroservice: MockMicroservice
}
