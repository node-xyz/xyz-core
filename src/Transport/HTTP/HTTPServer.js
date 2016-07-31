const http = require('http');
const url = require('url');
const request = require('request');
const EventEmitter = require('events') ;
const CONSTANTS = require('../../Config/Constants');
const logger = require('./../../Log/Logger');
const GenericMiddlewareHandler = require('./../../Middleware/GenericMiddlewareHandler');
const machineReport = require('./../../Util/machine.reporter') ;

class HTTPServer extends EventEmitter {
  constructor(devPort) {
    super();
    this.port = devPort || CONSTANTS.http.port;

    this.publicMiddlewareHandler = new GenericMiddlewareHandler();
    this.publicMiddlewareHandler.register(-1, require('./../Middlewares/request.logger.middleware.js'));
    this.publicMiddlewareHandler.register(-1, require('./../Middlewares/request.event.middleware.js'));

    this.internalMiddlewareHandler = new GenericMiddlewareHandler() ;
    this.internalMiddlewareHandler.register(-1, require('./../Middlewares/ping.logger.middleware.js'));
    this.internalMiddlewareHandler.register(-1, require('./../Middlewares/ping.event.middleware.js'));

    this.server = http.createServer()
      .listen(this.port, () => {
        logger.debug(`Server listening on: http://localhost:${this.port}`);
      }).on('request', (req, resp) => {
        var body = [];
        req
          .on('data', (chuck) => {
            body.push(chuck);
          })
          .on('end', () => {
            let parsedUrl = url.parse(req.url);
            let self = this ; // TODO fix this

            if ( parsedUrl.pathname === `/${CONSTANTS.url.CALL}`) {
              if ( parsedUrl.query.split('&').length > 1 ) {
                req.destroy();
              }
              else {
                this.publicMiddlewareHandler.apply([req, resp, JSON.parse(body), self]);
              }
            }
            else if ( parsedUrl.pathname === `/${CONSTANTS.url.PING}`) {
              console.log( machineReport( (err, data) => console.log(err, data)) );
              this.internalMiddlewareHandler.apply([req, resp, body, self]);
            }
            else {
              req.destroy();
            }
          });
      });
  }

  close(){
    this.server.close();
  }
}

module.exports = HTTPServer;
