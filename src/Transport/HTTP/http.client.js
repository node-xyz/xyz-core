const request = require('request');
const CONSTANTS = require('../../Config/Constants');
const _RSA = require('./../../Config/rsa.global');
const logger = require('./../../Log/Logger');
const machineReport = require('./../../Util/machine.reporter');
let GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler');

class HTTPClient {
  constructor() {
    this.callPostfix = CONSTANTS.url.CALL;
    this.pingPrefix = CONSTANTS.url.PING;

    this.callDispatchMidllewareStack = new GenericMiddlewareHandler();
    this.callDispatchMidllewareStack.register(-1, require('./../Middlewares/call/call.dispatch.logger.middleware'));
    this.callDispatchMidllewareStack.register(-1, require('./../Middlewares/call/call.dispatch.export.middleware'));

    this.pingDispatchMiddlewareStack = new GenericMiddlewareHandler();
    this.pingDispatchMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.dispatch.logger.middleware'));
    this.pingDispatchMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.dispatch.export.middleware'));


  }

  send(config, userPayload, responseCallback) {
    let options = {
      uri: `${config.uri}/${this.callPostfix}`,
      method: 'POST',
      qs: {
        'service': config.serviceName
      },
      json: {
        userPayload: userPayload
      } // Todo transform this to XRequest ?
    };
    // TODO structure of these params gefählt mir nicht!
    this.callDispatchMidllewareStack.apply([options, responseCallback], 0);
  }

  ping(config, responseCallback) {
    machineReport((err, report) => {
      // TODO catch the error here
      let options = {
        uri: `${config.host}:${config.port}/${this.pingPrefix}`,
        method: "POST",
        body: JSON.stringify(report)
      };
      this.pingDispatchMiddlewareStack.apply([options], 0);
    })

    //
    // request(options, (err, response, body) => {
    //   responseCallback(err, body)
    // })
  }
}

module.exports = HTTPClient;
