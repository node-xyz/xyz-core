import { CONFIG } from './../../Config/config.global';
import { GenericMiddlewareHandler } from './../../Middleware/generic.middleware.handler';
import { logger } from './../../Log/Logger';
import * as http from 'http'
import * as url from 'url'
import * as EventEmitter from 'events'
import {_xResponse, IxReceivedMessage} from './../Interfaces'
import {wrapper} from './../../Util/Util'
import _httpMessageEvent from './../Middlewares/http.receive.event'
import XYZ from './../../xyz'

export default class HTTPServer extends EventEmitter {
  xyz: XYZ; 
  port: number; 
  serverId: Object; 
  routes: Object; 
  server: any;

  /**
   * Creates a new HTTP server
   * @param xyz {Object} a reference to the curretn xyz object. will be filled automatically.
   * @param port {String|Number} The main port of this server.
   */
  constructor (xyz, port) {
    super()
    http.globalAgent.maxSockets = Infinity
    this.port = port || CONFIG.getSelfConf().transport[0].port
    this.xyz = xyz

    this.serverId = {
      type: 'HTTP',
      port: port
    }

    this.routes = {}

    let callReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'call.receive.mw', 'CALL')
    callReceiveMiddlewareStack.register(-1, _httpMessageEvent)
    // on this time only we will do it manually instead of calling registerRoute
    this.routes['CALL'] = callReceiveMiddlewareStack
    logger.info(`HTTP Server @ ${this.port} :: new message route ${wrapper('bold', 'CALL')} added`)

    this.server = http.createServer()
      .listen(this.port, () => {
        logger.info(`HTTP Server @ ${this.port} :: HTTP Server listening on port : ${this.port}`)
      }).on('request', (req, resp) => {
        var body = []
        req
        .on('data', (chuck) => {
          body.push(chuck)
        })
        .on('end', () => {
          if (!this.validator(req, body)) {
            req.destroy()
            return
          }
          let parsedUrl = url.parse(req.url)
          let dismissed = false
          for (let route in this.routes) {
            if (parsedUrl.pathname === `/${route}`) {
              // wrap response
              _xResponse(resp)

              // create mw param message object
              let xMessage: IxReceivedMessage = {
                serverId: this.serverId,
                message: JSON.parse(body.toString()),
                response: resp,
                meta: {request: req}
              }

              this.routes[route].apply(xMessage, 0)
              dismissed = true
              break
            }
          }
          if (!dismissed) {
            req.destroy()
          }
        })
      })
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

  validator (req, body) {
    if (req.method !== 'POST') {
      logger.warn('a suspicous message was received.')
      return false
    }
    if (body.length === 0) {
      logger.warn('a suspicous message was received.')
      return false
    }
    return true
  }

  // will initialize a new route with one default middleware
  // NOTE: this is experimental and there is no support to send sth directly to this
  // from whithin xyz. this is designed mostly for users outside of the system to have
  // a communication way
  registerRoute (prefix, gmwh) {
    let globalUnique = this.xyz.serviceRepository.transport._checkUniqueRoute(prefix)
    if (!globalUnique) {
      logger.error(`HTTP Server @ ${this.port} :: route ${prefix} is not unique.`)
      return false
    } else {
      gmwh = gmwh || new GenericMiddlewareHandler(this.xyz, `${prefix}.receive.mw`, prefix)
      this.routes[prefix] = gmwh
      logger.info(`HTTP Server @ ${this.port} :: new message route ${wrapper('bold', prefix)} added`)
      return 1
    }
  }

  /**
   * Will stop the server.
   */
  terminate () {
    logger.warn(`HTTP Server @ ${this.port} :: CLOSING`)
    this.close()
  }

}
