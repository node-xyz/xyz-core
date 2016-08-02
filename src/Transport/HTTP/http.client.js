const request = require('request');
const CONSTANTS = require('../../Config/Constants');
const logger = require('./../../Log/Logger');

class HTTPClient {
  constructor() {
    this.callPostfix = CONSTANTS.url.CALL;
    this.pingPrefix = CONSTANTS.url.PING;
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
    request.post(options, (err, response, body) => {
      logger.info(err, body);
      responseCallback(err, body);
    })
  }

  ping(config, responseCallback) {
    let options = {
      uri: `${config.host}:${config.port}/${this.pingPrefix}`,
      method: "POST",
    };
    request(options, (err, response, body) => {
      responseCallback(err, body)
    })
  }
}

module.exports = HTTPClient;
