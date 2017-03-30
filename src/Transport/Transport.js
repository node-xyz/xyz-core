const logger = require('./../Log/Logger')
const CONFIG = require('./../Config/config.global')
const GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')
const wrapper = require('./../Util/Util').wrapper
const HTTPServer = require('./HTTP/http.server')
const UDPServer = require('./UDP/udp.server')
const xSentMessage = require('./xSentMessage')
const xSentMessageMwParam = require('./xSentMessageMwParam')

class Transport {

  /**
   * Transport layer. This layer is an abstraction above all different sorts of communication.
   */
  constructor (xyz) {
    this.xyz = xyz

    this.routes = {}
    this.servers = {}

    let callDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'call.dispatch.mw', 'CALL')
    callDispatchMiddlewareStack.register(-1, require('./Middlewares/call/http.export.middleware'))
    this.registerRoute('CALL', callDispatchMiddlewareStack)
  }

  inspect () {
    let ret = `${wrapper('green', wrapper('bold', 'outgoing middlewares'))}:\n`
    for (let route in this.routes) {
      ret += `    ${this.routes[route].inspect()}\n`
    }
    ret += '\n'
    for (let s in this.servers) {
      ret += `  ${wrapper('bold', wrapper('magenta', this.servers[s].constructor.name + ' @ ' + s))} ::\n`
      ret += `    ${this.servers[s].inspect()}\n`
    }
    return ret
  }

  inspectJSON () {
    let ret = {'outgoingRoutes': [], servers: []}
    for (let route in this.routes) {
      ret.outgoingRoutes.push(this.routes[route].inspectJSON())
    }

    for (let s in this.servers) {
      ret.servers.push(this.servers[s].inspectJSON())
    }
    return ret
  }

  /**
   *
   * opt should have:
   *   - node {string} address of destination,
   *   - route {string} url of outgoing middleware stack
   *   - payload {object}. depending on `route` , it can have `userPayload`, `service` or `_id`
   * @param opt {Obeject} the options object.
   * @param responseCallback {Function} the callback of the message. Note that this is valid
   * only for http calls. UDP / TCP calls do not have a callback
   */
  send (opt, responseCallback) {
    opt.route = opt.route || 'CALL'

    if (!this.routes[opt.route]) {
      logger.error(`attempting to send message in route ${opt.route}. DOES NOT EXIST`)
      responseCallback('outgoing message route not found', null)
      return
    }

    let _port
    // TODO: BUG
    // here we are assuming that a route is unique in each NODE, not server
    // it should be checked...
    if (opt.redirect) {
      _port = this._findTargetPort(opt.route, opt.node)
      if (_port === -1) {
        logger.error(`Transport Client :: could not find route ${opt.route} in destination node ${opt.node}. aborting transmission`)
        if (responseCallback) {
          responseCallback('target port/route not found', null)
        }
        return
      }
    }

    let message = {
      userPayload: opt.payload,
      xyzPayload: {
        senderId: this.xyz.id().netId,
        service: opt.service
      }
    }

    // the json key
    let xMessage = new xSentMessage(message)

    let requestConfig = {
      hostname: `${opt.node.split(':')[0]}`,
      port: _port || `${opt.node.split(':')[1]}`,
      path: `/${opt.route}`,
      method: 'POST',
      json: xMessage
    }

    // mw param
    let xMessageParam = new xSentMessageMwParam({
      requestConfig: requestConfig,
      responseCallback: responseCallback
    })

    logger.debug(`${wrapper('bold', 'Transport Client')} :: sending message to ${wrapper('bold', requestConfig.hostname)}:${requestConfig.port}/${opt.route} through ${this.routes[opt.route].name} middleware :: message ${JSON.stringify(xMessage)}`)

    this.routes[opt.route].apply(xMessageParam, 0)
  }

  registerServer (type, port, e) {
    let server
    if (type === 'HTTP') {
      server = new HTTPServer(this.xyz, port)
      this.servers[port] = server
      CONFIG.addServer({type: type, port: port, event: e})
      return server
    } else if (type === 'UDP') {
      server = new UDPServer(this.xyz, port)
      this.servers[port] = server
      CONFIG.addServer({type: type, port: port, event: e})
      return server
    } else {
      logger.error(`transport server type ${type} undefined`)
      return false
    }
  }

  registerRoute (prefix, gmwh) {
    logger.info(`Transport :: new outgoing message route ${wrapper('bold', prefix)} added`)
    if (gmwh) {
      this.routes[prefix] = gmwh
    } else {
      logger.warn(`no middlewareHandler defined for route ${prefix}. an empty one will be used`)
      this.routes[prefix] = new GenericMiddlewareHandler(this.xyz, `${prefix}.dispatch.mw`, prefix)
    }
    return 1
  }

  getServerRoutes () {
    let ret = {}
    for (let s in this.servers) {
      ret[s] = Object.keys(this.servers[s].routes)
    }
    return ret
  }

  _findTargetPort (route, node) {
    let foreignRoutes = this.xyz.serviceRepository.foreignRoutes[node]
    for (let p in foreignRoutes) {
      for (let r of foreignRoutes[p]) {
        if (r === route) {
          return p
        }
      }
    }
    return -1
  }

}

module.exports = Transport
