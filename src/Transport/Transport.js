const http = require('http');
const request = require('request');
const CONSTANTS = require('../Config/Constants');
const EventEmitter = require('events') ;

class HTTPServer extends EventEmitter {

  constructor(devPort) {
    super();
    var a = 1;
    this.port = devPort || CONSTANTS.http.port;
    this.server = http.createServer()
      .listen(this.port, () => {
        console.log(`Server listening on: http://localhost:${this.port}`);
      }).on('request', (req, resp) => {
        var body = [];
        var self = this ; // TODO fix this
        req
          .on('data', (chuck) => {
            body.push(chuck);
          })
          .on('end', () => {
            self.emit(CONSTANTS.events.REQUEST, {url: req.url, body: body, response: resp});
          });
      });
  }
}

class HTTPClient {
  constructor(){}

  send(config, data, responseCallback) {
    var options = {
      uri: `${config.host}:${config.port}/${config.name}`,
      method: 'POST',
      json: data
    };
    console.log(options);
    request.post(options, (err, responseData) => {
      responseCallback(err, responseData);
    })
  }
}

module.exports = {
  HTTPServer: HTTPServer,
  HTTPClient: HTTPClient
};
