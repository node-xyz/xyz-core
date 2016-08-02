let http = require('http');
let HTTP = require('../Transport/Transport').HTTP;
let CONSTANTS = require('../Config/Constants');
let GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')

const XResponse = require('../Transport/XResponse');
const Util = require('./../Util/Util');

class ServiceRepository {
  constructor(serviceConf, systemConf) {
    this.serviceConfiguration = serviceConf;
    this.systemConfiguration = systemConf;
    this.transportServer = new HTTP.Server(this.serviceConfiguration.net.port);
    this.transportClient = new HTTP.Client();

    this.callReceiveMiddleware = new GenericMiddlewareHandler();
    this.callReceiveMiddleware.register(0, require('./Middlewares/call.middleware.first.find'));

    this.services = {};
    this.foreignServices = {};

    this.transportServer.on(CONSTANTS.events.REQUEST, (rcvPacket, response) => {
      for (var serviceName in this.services) {
        if (serviceName === rcvPacket.serviceName) {
          this.services[serviceName].fn(rcvPacket.userPayload, new XResponse(response));
          return
        }
      }
      response.writeHead(404, {});
      response.write(http.STATUS_CODES[404]);
      response.end();
    });

    this.transportServer.on(CONSTANTS.events.PING, (response) => {
      response.end(JSON.stringify(Object.keys(this.services)));
    });

    this.ping();
    setInterval(() => this.ping(), (CONSTANTS.intervals.ping + Util.Random(CONSTANTS.intervals.threshold)))

  }

  register(name, fn) {
    this.services[name] = { fn: fn }
  };

  call(serviceName, userPayload, responseCallback) {
    this.callReceiveMiddleware.apply([serviceName, userPayload, this.foreignServices, this.transportClient, responseCallback])
  };

  getTransportLayer() {
    return {
      Server: this.transportServer,
      Client: this.transportClient
    }
  }

  ping() {
    let nodes = this.systemConfiguration.microservices;
    for (let node of nodes) {
      this.transportClient.ping(node, (err, responseData) => {
        if (err) {
          return
        }
        this.foreignServices[node.host + ':' + node.port] = responseData;
      })
    }
  }

  terminate() {
    this.transportServer.close();
  }
}

module.exports = ServiceRepository;
