/**
 * Created by Kian on 7/22/16.
 */
var http = require('http');
var HTTP = require('../Transport/Transport');
var CONSTANTS  = require('../Config/Constants');
const XResponse = require('../Transport/XResponse');

class ServiceRepository {
  constructor(devPort){
    this.httpServer = new HTTP.HTTPServer(devPort);
    this.httpClient = new HTTP.HTTPClient();

    this.services = {};

    this.httpServer.on(CONSTANTS.events.REQUEST, (rcvPacket, response) => {
      for ( var serviceName in this.services ) {
        if ( serviceName === rcvPacket.serviceName ) {
          this.services[serviceName].fn(rcvPacket.userPayload , new XResponse(response));
          return
        }
      }
      response.writeHeader(404);
      response.write(http.STATUS_CODES[404]);
      response.end();
    });
  }

  register(name, fn) {
    this.services[name] = {fn: fn}
  };


  call(serviceName, userPayload, responseCallback) {
    // temp . no service discovery for now. all are expected to locate on port 3333
    let config = {serviceName: serviceName, host: "http://localhost", port: 3333};
    this.httpClient.send(config, userPayload, (err, responseData) => {
      responseCallback(err, responseData);
    })
  };

  terminate() {
    this.httpServer.close();
  }
}

module.exports = ServiceRepository;