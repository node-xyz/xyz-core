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
        console.log(`Server listening on: http://localhost:${this.port}`);
      }).on('request', (req, resp) => {
        if ( url.parse(req.url).query.split('&').length > 1 ) {
          req.destroy();
          console.log(`aborting request to ${req.url} - INVALID query`)
        }
        else {
          var body = [];
          var self = this ; // TODO fix this
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
      });
  }

  close(){
    this.server.close();
  }
}

class HTTPClient {
  constructor(){
    this.callPostfix = CONSTANTS.url.CALL;
  }


  send(config, userPayload, responseCallback) {
    let options = {
      uri: `${config.host}:${config.port}/${this.callPostfix}`,
      method: 'POST',
      qs: {'service': config.serviceName},
      json: {userPayload : userPayload}
    };
    request.post(options, (err, responseData, body) => {
      responseCallback(err, body);
    })
  }
}

module.exports = {
  HTTPServer: HTTPServer,
  HTTPClient: HTTPClient
};
