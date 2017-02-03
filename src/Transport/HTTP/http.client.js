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

    let callDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'callDispatchMiddlewareStack')
    callDispatchMiddlewareStack.register(-1, require('./../Middlewares/call/call.dispatch.export.middleware'))

    let pingDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'pingDispatchMiddlewareStack')
    pingDispatchMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.dispatch.export.middleware'))

    let joinDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'joinDispatchMiddlewareStack')
    joinDispatchMiddlewareStack.register(-1, require('./../Middlewares/cluster/join.middleware.export'))

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
    if (gmwh) {
      this.routes[prefix] = gmwh
    } else {
      this.routes[prefix] = new GenericMiddlewareHandler(this.xyz, `${prefix}-MiddlewareHandler`)
    }
  }

  _send (opt, responseCallback) {
    opt.route = opt.route || 'CALL'
    let requestConfig = {
      hostname: `${opt.node.split(':')[0]}`,
      port: `${opt.node.split(':')[1]}`,
      path: `/${opt.route}`,
      method: `POST`,
      json: opt.payload
    }
    this.routes[opt.route].apply([requestConfig, responseCallback], 0, this.xyz)
  }

  send (servicePath, node, userPayload, callResponseCallback) {
    this._send({
      route: 'CALL',
      node: node,
      payload: { service: servicePath, userPayload: userPayload }
    }, callResponseCallback)
    return

    let requestConfig = {
      hostname: `${node.split(':')[0]}`,
      port: node.split(':')[1],
      path: `/${this.callPostfix}`,
      method: 'POST',
      json: { userPayload: userPayload, service: servicePath}
    }
    this.callDispatchMiddlewareStack.apply([requestConfig, callResponseCallback], 0, this.xyz)
  }

  ping (node, pingResponseCallback) {
    this._send({
      route: 'PING',
      node: node,
      payload: { sender: `${_CONFIGURATIONS.getSelfConf().host}:${_CONFIGURATIONS.getSelfConf().port}` }
    }, pingResponseCallback)
    return

    let requestConfig = {
      hostname: `${node.host}`,
      port: node.port,
      path: `/${this.pingPrefix}`,
      method: 'POST',
      json: { sender: `${_CONFIGURATIONS.getSelfConf().host}:${_CONFIGURATIONS.getSelfConf().port}` }
    }
    this.pingDispatchMiddlewareStack.apply([requestConfig, pingResponseCallback], 0, this.xyz)
  }

  contactSeed (node, joinResponseCallback) {
    this._send({
      route: 'JOIN',
      node: node,
      payload: { sender: `${_CONFIGURATIONS.getSelfConf().host}:${_CONFIGURATIONS.getSelfConf().port}` }
    }, joinResponseCallback)
    return

    let requestConfig = {
      hostname: node.host,
      port: node.port,
      path: `/${CONSTANTS.url.JOIN}`,
      method: 'POST',
      json: { sender: `${_CONFIGURATIONS.getSelfConf().host}:${_CONFIGURATIONS.getSelfConf().port}` }
    }
    this.joinDispatchMiddlewareStack.apply([requestConfig, joinResponseCallback], 0, this.xyz)
  }

}

module.exports = HTTPClient
