const querystring = require('querystring')
const CONSTANTS = require('../../Config/Constants')
const logger = require('./../../Log/Logger')
const machineReport = require('./../../Util/machine.reporter')
const _CONFIGURATIONS = require('./../../Config/config.global')
let GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler')
let wrapper = require('./../../Util/Util').wrapper

class HTTPClient {
  constructor (xyz) {
    this.callPostfix = CONSTANTS.url.CALL
    this.pingPrefix = CONSTANTS.url.PING
    this.xyz = xyz

    let callDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'callDispatchMiddlewareStack', 'CALL')
    callDispatchMiddlewareStack.register(-1, require('./../Middlewares/call/http.export.middleware'))

    let pingDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'pingDispatchMiddlewareStack', 'PING')
    pingDispatchMiddlewareStack.register(-1, require('./../Middlewares/call/http.export.middleware'))

    let joinDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'joinDispatchMiddlewareStack', 'JOIN')
    joinDispatchMiddlewareStack.register(-1, require('./../Middlewares/call/http.export.middleware'))

    this.routes = {}

    this.registerRoute('CALL', callDispatchMiddlewareStack)
    this.registerRoute('PING', pingDispatchMiddlewareStack)
    this.registerRoute('JOIN', joinDispatchMiddlewareStack)
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
    for (let route in this.callRoutes) {
      ret.push(this.routes[route].inspectJSON())
    }
    return ret
  }

  registerRoute (prefix, gmwh) {
    logger.info(`HTTP Client:: new call route ${wrapper('bold', prefix)} added`)
    if (gmwh) {
      this.routes[prefix] = gmwh
    } else {
      this.routes[prefix] = new GenericMiddlewareHandler(this.xyz, `${prefix}-MiddlewareHandler`)
      this.routes[prefix].register(-1, require('./../Middlewares/call/http.export.middleware'))
    }
  }

  // opt should have:
  //   - node {string} address of destination,
  //   - route {string} url of outgoing middleware stack
  //   - payload {object}. depending on `route` , it can have `userPayload`, `service` or `sender`
  send (opt, responseCallback) {
    logger.verbose(`${wrapper('bold', 'HTTP Client')} :: sending request to ${opt.node}/${opt.route} through ${this.routes[opt.route].name}`)
    opt.route = opt.route || 'CALL'
    let requestConfig = {
      hostname: `${opt.node.split(':')[0]}`,
      port: `${opt.node.split(':')[1]}`,
      path: `/${opt.route}`,
      method: `POST`,
      json: opt.payload
    }
    this.routes[opt.route].apply([requestConfig, responseCallback], 0)
  }
}

module.exports = HTTPClient
