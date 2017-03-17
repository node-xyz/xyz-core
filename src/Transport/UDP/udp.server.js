const dgram = require('dgram')
const EventEmitter = require('events')
const logger = require('./../../Log/Logger')
const GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler')
const _CONFIGURATION = require('./../../Config/config.global')
let wrapper = require('./../../Util/Util').wrapper

class UDPServer extends EventEmitter {
  constructor (xyz, port) {
    super()
    this.port = _CONFIGURATION.getSelfConf().port
    this.xyz = xyz

    this.server = dgram.createSocket('udp4')
    this.routes = {}

    // user defined routes

    this.server.on('listening', () => {
      let address = this.server.address()
      logger.info(`UDP Server listening on port ${address.address}:${address.port}`)
    })
    .on('message', (message, remote) => {
      let _message = JSON.parse(message.toString())
      for (let route in this.routes) {
        if (_message.path === `/${route}`) {
          logger.debug(`udp message received for /${wrapper('bold', route)} [${JSON.stringify(_message)}]`)
          this.routes[route].apply([_message, remote, port], 0)
          break
        }
      }
    })
    .bind(port, _CONFIGURATION.getSelfConf().host)
  }

  inspect () {
    let ret = `${wrapper('green', wrapper('bold', 'Middlewares'))}:\n`

    for (let route in this.routes) {
      ret += `    ${this.routes[route].inspect()}\n`
    }
    return ret
  }

  inspectJSON () {
    let ret = []
    for (let route in this.routes) ret.push(this.routes[route].inspectJSON())
    return ret
  }

  close () {
    this.server.close()
  }

  // will initialize a new route with one default middleware
  // NOTE: this is experimental and there is no support to send sth directly to this
  // from whithin xyz. this is designed mostly for users outside of the system to have
  // a communication way
  registerRoute (prefix, gmwh) {
    if (this.routes[prefix]) {
      logger.warn(`call middleware with prefix ${prefix} already exists`)
      return -1
    } else {
      gmwh = gmwh || new GenericMiddlewareHandler(this.xyz, `${prefix}.receive.mw`, prefix)
      this.routes[prefix] = gmwh
      logger.info(`HTTP Server:: new call route ${wrapper('bold', prefix)} added`)
      return 1
    }
  }

}

module.exports = UDPServer
