const http = require('http');
const url = require('url');
const request = require('request');
const EventEmitter = require('events') ;
const CONSTANTS = require('../Config/Constants');

class HTTPServer extends EventEmitter {

  constructor(devPort) {
    super();
    this.port = devPort || CONSTANTS.http.port;
    this.server = http.createServer()
      .listen(this.port, () => {
        // console.log(`Server listening on: http://localhost:${this.port}`);
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
                self.emit(
                  CONSTANTS.events.REQUEST,
                  { userPayload: JSON.parse(body).userPayload, serviceName: url.parse(req.url).query.split('=')[1] } , resp);
              });
          }
        }
        else if (  parsedUrl.pathname === `/${CONSTANTS.url.PING}`) {
          self.emit(CONSTANTS.events.PING, resp)
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
