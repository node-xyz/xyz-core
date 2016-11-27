const querystring = require('querystring')
const CONSTANTS = require('../../Config/Constants')
const logger = require('./../../Log/Logger')
const machineReport = require('./../../Util/machine.reporter')
const _CONFIGURATIONS = require('./../../Config/config.global')
let GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler')

class HTTPClient {
  constructor () {
    this.callPostfix = CONSTANTS.url.CALL
    this.pingPrefix = CONSTANTS.url.PING

    this.callDispatchMidllewareStack = new GenericMiddlewareHandler()
    this.callDispatchMidllewareStack.register(-1, require('./../Middlewares/call/call.dispatch.export.middleware'))

    this.pingDispatchMiddlewareStack = new GenericMiddlewareHandler()
    this.pingDispatchMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.dispatch.export.middleware'))

    this.joinDispatchMiddlewareStack = new GenericMiddlewareHandler()
    this.joinDispatchMiddlewareStack.register(-1, require('./../Middlewares/cluster/join.middleware.export'))
  }

  send (servicePath, node, userPayload, callResponseCallback) {
    let requestConfig = {
      hostname: `${node.split(':')[0]}`,
      port: node.split(':')[1],
      path: `/${this.callPostfix}`,
      method: 'POST',
      json: { userPayload: userPayload, service: servicePath}
    }
    this.callDispatchMidllewareStack.apply([requestConfig, callResponseCallback], 0)
  }

  ping (node, pingResponseCallback) {
    let requestConfig = {
      hostname: `${node.host}`,
      port: node.port,
      path: `/${this.pingPrefix}`,
      method: 'POST',
      json: { sender: `${_CONFIGURATIONS.getSelfConf().host}:${_CONFIGURATIONS.getSelfConf().port}` }
    }
    this.pingDispatchMiddlewareStack.apply([requestConfig, pingResponseCallback], 0)
  }

  contactSeed (node, joinResponseCallback) {
    let requestConfig = {
      hostname: node.host,
      port: node.port,
      path: `/${CONSTANTS.url.JOIN}`,
      method: 'POST',
      json: { sender: `${_CONFIGURATIONS.getSelfConf().host}:${_CONFIGURATIONS.getSelfConf().port}` }
    }
    this.joinDispatchMiddlewareStack.apply([requestConfig, joinResponseCallback], 0)
  }

}

module.exports = HTTPClient
