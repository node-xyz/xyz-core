const XYZ = require('./../../index')
const fs = require('fs')
const logger = require('./../../src/Log/Logger')
/**
 * A Wrapper class around microservice interface
 */
class MockMicroservice {
  constructor (name, port, cwd) {
    let selfConfiguration = {
      'name': name,
      'host': 'localhost',
      'port': port
    }

    fs.writeFileSync(`${cwd}/${name}.json`, JSON.stringify(selfConfiguration))
    this.xyz = new XYZ({
      selfConf: require(`./../tests/${name}.json`),
      systemConf: require(`./../tests/xyzTest.json`)
    })
  }

  register (name, fn) {
    this.xyz.register(name, fn)
  }

  call (name, data, callback) {
    this.xyz.call(name, data, callback)
  }

  emit (eventName, userPayload) {
    this.xyz.emit(eventName, userPayload)
  }

  subscribe (eventName) {
    this.xyz.subscribe(eventName)
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
