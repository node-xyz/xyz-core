const XYZ = require('./../../index')
const fs = require('fs')
let logger
/**
 * A Wrapper class around microservice interface
 */
class mockNode {
  constructor (name, port, cwd, systemConf) {
    let selfConf = {
      'logLevel': 'info',
      'name': name,
      'host': 'localhost',
      'transport': [{type: 'HTTP', port: port}]
    }

    this.conf = selfConf
    this.xyz = new XYZ({
      selfConf: selfConf,
      systemConf: systemConf
    })

    logger = this.xyz.logger
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
