const request = require('request');
const CONSTANTS = require('../../Config/Constants');
const _RSA = require('./../../Config/rsa.global');
const logger = require('./../../Log/Logger');
const machineReport = require('./../../Util/machine.reporter');
const _CONFIGURATIONS = require('./../../Config/config.global');
let GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler');

class HTTPClient {
  constructor() {
    this.callPostfix = CONSTANTS.url.CALL;
    this.pingPrefix = CONSTANTS.url.PING;

    this.callDispatchMidllewareStack = new GenericMiddlewareHandler();
    this.callDispatchMidllewareStack.register(-1, require('./../Middlewares/global.dispatch.logger.middleware'));
    this.callDispatchMidllewareStack.register(-1, require('./../Middlewares/call/call.dispatch.export.middleware'));

    this.pingDispatchMiddlewareStack = new GenericMiddlewareHandler();
    this.pingDispatchMiddlewareStack.register(-1, require('./../Middlewares/global.dispatch.logger.middleware'));
    this.pingDispatchMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.dispatch.auth.basic'));
    this.pingDispatchMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.dispatch.export.middleware'));

  }

  send(config, userPayload, callResponseCallback) {
    let options = {
      uri: `${config.uri}/${this.callPostfix}`,
      method: 'POST',
      qs: {
        'service': config.serviceName
      },
      json: {
        userPayload: userPayload
      }
    };
    this.callDispatchMidllewareStack.apply([options, callResponseCallback], 0);
  }

  ping(node, pingResponseCallback) {
    let requestConfig = {
      method: "POST",
      uri: `${node.host}:${node.port}/${this.pingPrefix}`,
      json: { sender: `${_CONFIGURATIONS.getServiceConf().net.host}:${_CONFIGURATIONS.getServiceConf().net.port}` }
    }
    this.pingDispatchMiddlewareStack.apply([requestConfig, pingResponseCallback], 0);
  }

  emit(node, userPayload) {
    let requestConfig = {
      method: 'POST',
      uri: `${node.host}/`
    }
  }

}

module.exports = HTTPClient;
