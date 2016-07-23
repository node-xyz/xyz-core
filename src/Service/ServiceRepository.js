/**
 * Created by Kian on 7/22/16.
 */
var HTTP = require('../Transport/Transport');
var EventEmitter = require('events') ;
var CONSTANTS  = require('../Config/Constants');

class ServiceRepository {
  constructor(devPort){
    this.httpServer = new HTTP.HTTPServer(devPort);
    this.httpClient = new HTTP.HTTPClient();

    this.services = {};


    this.httpServer.on(CONSTANTS.events.REQUEST, (data) => {
      for ( var serviceName in this.services ) {
        if ( serviceName === data.url.replace('/','') ) {
          this.services[serviceName].fn(JSON.parse(data.body[0].toString()) , data.response);
          return
        }
      }
      data.response.writeHead(404).end('ms not found');
    });
  }

  register(name, fn) {
    this.services[name] = {fn: fn}
  };


  call(name, data, responseCallback) {
    // temp . no service discovery for now. all are expected to locate on port 3333
    this.httpClient.send({name: name, host: "http://localhost", port: 3333}, data, function (err, responseData) {
      responseCallback(err, responseData);
    })
  };
}

module.exports = ServiceRepository;