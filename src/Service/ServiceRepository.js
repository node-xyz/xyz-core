var http = require('http');
var HTTP = require('../Transport/Transport');
var CONSTANTS  = require('../Config/Constants');
const XResponse = require('../Transport/XResponse');
const Util = require('./../Util/Util');

class ServiceRepository {
  constructor(serviceConf, systemConf) {
    this.serviceConfiguration = serviceConf;
    this.systemConfiguration = systemConf;
    this.transportServer = new HTTP.HTTPServer(this.serviceConfiguration.net.port);
    this.transportClient = new HTTP.HTTPClient();

    this.services = {};
    this.foreignServices = {};

    this.transportServer.on(CONSTANTS.events.REQUEST, (rcvPacket, response) => {
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

    this.transportServer.on(CONSTANTS.events.PING , (response) => {
      response.end(JSON.stringify(Object.keys(this.services)));
    });

    this.ping();
    setInterval(() => this.ping(), (CONSTANTS.intervals.ping + Util.Random(CONSTANTS.intervals.threshold)) )

  }

  register(name, fn) {
    this.services[name] = {fn: fn}
  };

  call(serviceName, userPayload, responseCallback) {
    for ( let node in this.foreignServices ) {
      let index = this.foreignServices[node].indexOf(serviceName) ;
      if ( index > -1 ) {
        let config = {serviceName: serviceName, uri: node };
        this.transportClient.send(config, userPayload, (err, responseData) => {
          responseCallback(err, responseData);
        });
        return
      }
    }
    responseCallback(http.STATUS_CODES[404], null)
  };

  getTransportLayer() {
    return {
      Server: this.transportServer,
      Client: this.transportClient
    }
  }

  ping() {
    let nodes = this.systemConfiguration.microservices;
    for ( let node of nodes ) {
      this.transportClient.ping(node, (err, responseData) => {
        if ( err ) { return }
        this.foreignServices[node.host + ':' + node.port] = responseData;
      })
    }
  }

  terminate() {
    this.transportServer.close();
  }
}

module.exports = ServiceRepository;