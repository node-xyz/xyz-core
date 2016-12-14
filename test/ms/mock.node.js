const XYZ = require('./../../index').xyz
const fs = require('fs')
const logger = require('./../../index').logger
/**
 * A Wrapper class around microservice interface
 */
class mockNode {
  constructor (name, port, cwd, systemConf) {
    let selfConfiguration = {
      'logLevel': 'info',
      intervals: {ping: 1000, threshold: 500},
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
    logger.warn('service stopped')
    this.xyz.terminate()
  }
}

module.exports = {
  mockNode: mockNode
}
