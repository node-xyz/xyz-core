/**
 * Created by Kian on 7/22/16.
 */
var http = require('http');
var HTTP = require('../Transport/Transport');
var CONSTANTS  = require('../Config/Constants');
const XResponse = require('../Transport/XResponse');

class ServiceRepository {
  constructor(selfName){
    this.selfName = selfName;
    this.configuration = require(`${process.cwd()}/_${this.selfName}`);
    this.transportServer = new HTTP.HTTPServer(this.configuration.net.port);
    this.transportClient = new HTTP.HTTPClient();
    console.log(this.configuration);

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
    setInterval(() => this.ping(), 5000)

  }

  register(name, fn) {
    this.services[name] = {fn: fn}
  };


  call(serviceName, userPayload, responseCallback) {
    // temp . no service discovery for now. all are expected to locate on port 3333
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
    responseCallback("Service Name not Found", null)
  };
  
  ping() {
    let nodes = this.configuration.microservices;
    for ( let node of nodes ) {
      this.transportClient.ping(node, (err, responseData) => {
        this.foreignServices[node.host + ':' + node.port] = responseData;
      })
    }
  }

  terminate() {
    this.transportServer.close();
  }
}

module.exports = ServiceRepository;