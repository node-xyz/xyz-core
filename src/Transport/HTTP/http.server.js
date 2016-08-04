const http = require('http');
const url = require('url');
const request = require('request');
const EventEmitter = require('events');
const CONSTANTS = require('../../Config/Constants');
const logger = require('./../../Log/Logger');
const GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler');
const machineReport = require('./../../Util/machine.reporter');

class HTTPServer extends EventEmitter {
  constructor(port) {
    super();
    this.port = port || CONSTANTS.http.port;

    this.callReceiveMiddlewareStack = new GenericMiddlewareHandler();
    this.callReceiveMiddlewareStack.register(-1, require('./../Middlewares/call/call.receive.logger.middleware'));
    this.callReceiveMiddlewareStack.register(-1, require('./../Middlewares/call/call.receive.event.middleware'));

    this.pingReceiveMiddlewareStack = new GenericMiddlewareHandler();
    this.pingReceiveMiddlewareStack.register(-1, require('./../Middlewares//ping/ping.receive.logger.middleware'));
    // this.pingReceiveMiddlewareStack.register(-1, require('./../Middlewares/rsa.auth.middleware'));
    this.pingReceiveMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.receive.event.middleware'));



    this.server = http.createServer()
      .listen(this.port, () => {
        logger.verbose(`Server listening on: http://localhost:${this.port}`);
      }).on('request', (req, resp) => {
        var body = [];
        req
          .on('data', (chuck) => {
            body.push(chuck);
          })
          .on('end', () => {
            let parsedUrl = url.parse(req.url);
            let self = this; // TODO fix this

            if (parsedUrl.pathname === `/${CONSTANTS.url.CALL}`) {
              if (parsedUrl.query.split('&').length > 1) {
                req.destroy();
              } else {
                this.callReceiveMiddlewareStack.apply([req, resp, JSON.parse(body), self], 0);
              }
            } else if (parsedUrl.pathname === `/${CONSTANTS.url.PING}`) {
              this.pingReceiveMiddlewareStack.apply([req, resp, body, self], 0);
            } else {
              req.destroy();
            }
          });
      });
  }

  close() {
    this.server.close();
  }
}

module.exports = HTTPServer;
