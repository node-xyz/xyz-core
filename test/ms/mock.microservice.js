const XYZ = require('./../../index').xyz
const fs = require('fs')
const logger = require('./../../index').logger
/**
 * A Wrapper class around microservice interface
 */
class MockMicroservice {
  constructor (name, port, cwd, systemConf) {
    let selfConfiguration = {
      'logLevel': 'verbose',
      'name': name,
      'host': 'localhost',
      'port': port
    }

    this.xyz = new XYZ({
      selfConf: selfConfiguration,
      systemConf: systemConf
    })
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
