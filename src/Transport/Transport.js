const http = require('http');
const url = require('url');
const request = require('request');
const EventEmitter = require('events') ;
const CONSTANTS = require('../Config/Constants');
const logger = require('./../Log/Logger');
const GenericMiddlewareHandler = require('./../Middleware/GenericMiddlewareHandler');

class HTTPServer extends EventEmitter {
  constructor(devPort) {
    super();
    this.port = devPort || CONSTANTS.http.port;

    this.publicMiddlewareHandler = new GenericMiddlewareHandler();
    this.publicMiddlewareHandler.register(-1, require('./Middlewares/request.logger.middleware'));
    this.publicMiddlewareHandler.register(-1, require('./Middlewares/request.event.middleware'));

    this.internalMiddlewareHandler = new GenericMiddlewareHandler() ;
    this.internalMiddlewareHandler.register(-1, require('./Middlewares/ping.logger.middleware'));
    this.internalMiddlewareHandler.register(-1, require('./Middlewares/ping.event.middleware'));

    this.server = http.createServer()
      .listen(this.port, () => {
        logger.debug(`Server listening on: http://localhost:${this.port}`);
      }).on('request', (req, resp) => {
        let parsedUrl = url.parse(req.url);
        let self = this ; // TODO fix this

        if ( parsedUrl.pathname === `/${CONSTANTS.url.CALL}`) {
          if ( parsedUrl.query.split('&').length > 1 ) {
            req.destroy();
          }
          else {
            var body = [];
            req
              .on('data', (chuck) => {
                body.push(chuck);
              })
              .on('end', () => {
                this.publicMiddlewareHandler.apply([req, resp, JSON.parse(body), self]);
              });
          }
        }
        else if (  parsedUrl.pathname === `/${CONSTANTS.url.PING}`) {
          this.internalMiddlewareHandler.apply([req, resp, body, self]);
        }
        else {
          req.destroy();
        }
      });
  }

  close(){
    this.server.close();
  }
}

class HTTPClient {
  constructor(){
    this.callPostfix = CONSTANTS.url.CALL;
    this.pingPrefix = CONSTANTS.url.PING;
  }

  send(config, userPayload, responseCallback) {
    let options = {
      uri: `${config.uri}/${this.callPostfix}`,
      method: 'POST',
      qs: {'service': config.serviceName},
      json: {userPayload : userPayload} // Todo transform this to XRequest ?
    };
    request.post(options, (err, response, body) => {
      responseCallback(err, body);
    })
  }

  ping(config,responseCallback) {
    let options = {
      uri: `${config.host}:${config.port}/${this.pingPrefix}`,
      method: "POST",
    };
    request(options, (err, response, body) => {
      responseCallback(err, body)
    })
  }
}

module.exports = {
  HTTPServer: HTTPServer,
  HTTPClient: HTTPClient
};
