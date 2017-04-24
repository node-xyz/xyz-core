import { wrapper } from './../../Util/Util'
import { logger } from './../../Log/Logger'
import { ITransportReceivedMessage } from './../transport.interfaces'
import { CONFIG } from './../../Config/config.global'
import { GenericMiddlewareHandler } from './../../Middleware/generic.middleware.handler'
import { EventEmitter } from 'events'
import * as dgram from 'dgram'
import XYZ from './../../xyz'

export default class UDPServer extends EventEmitter {
  port: number
  xyz: XYZ
  serverId: Object
  server: any
  routes: Object

  constructor (xyz: XYZ, port: number) {
    super()
    this.port = port
    this.xyz = xyz

    /**
     * Each server should have this attribute and pass it to the constructor of
     * xMiddlewareParam object
     */
    this.serverId = {
      type: 'UDP',
      port: port
    }

    this.server = dgram.createSocket('udp4')
    this.routes = {}

    this.server.on('listening', () => {
      let address = this.server.address()
      logger.info(`UDP Server listening on port ${address.address}:${address.port}`)
    })
    .on('message', (message, remote) => {
      let _message = JSON.parse(message.toString())
      for (let route in this.routes) {
        if (_message.xyzPayload.route === `/${route}`) {
          logger.debug(`UDP SERVER @ ${this.port} :: udp message received for /${wrapper('bold', route)} [${JSON.stringify(_message)}]`)

          let xMessage: ITransportReceivedMessage = {
            message: _message,
            response: undefined,
            serverId: this.serverId,
            meta: remote
          }

          this.routes[route].apply(xMessage, 0)
          break
        }
      }
    })
    .bind(port, CONFIG.getSelfConf().host)
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

  /**
   * Will close the server. duplicate of `.terminate()`
   */
  close () {
    this.server.close()
  }

  /**
   * Will close the server
   */
  terminate () {
    logger.warn(`UDP SERVER @ ${this.port} :: CLOSING`)
    this.close()
  }

  // will initialize a new route with one default middleware
  // NOTE: this is experimental and there is no support to send sth directly to this
  // from whithin xyz. this is designed mostly for users outside of the system to have
  // a communication way
  registerRoute (prefix, gmwh) {
    let globalUnique = this.xyz.serviceRepository.transport._checkUniqueRoute(prefix)
    if (!globalUnique) {
      logger.error(`UDP Server @ ${this.port} :: route ${prefix} is not unique.`)
      return false
    } else {
      gmwh = gmwh || new GenericMiddlewareHandler(this.xyz, `${prefix}.receive.mw`, prefix)
      this.routes[prefix] = gmwh
      logger.info(`UDP Server @ ${this.port} :: new message route ${wrapper('bold', prefix)} added`)
      return 1
    }
  }

}
