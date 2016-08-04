let http = require('http');
let HTTP = require('../Transport/Transport').HTTP;
let CONSTANTS = require('../Config/Constants');
let GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')
let _CONFIGURATIONS = require('./../Config/config.global');
const XResponse = require('../Transport/XResponse');
const Util = require('./../Util/Util');
let machineReport = require('./../Util/machine.reporter');

class ServiceRepository {
  constructor() {
    this.transportServer = new HTTP.Server(_CONFIGURATIONS.getServiceConf().net.port);
    this.transportClient = new HTTP.Client();

    this.callDispatchMiddlewareStack = new GenericMiddlewareHandler();
    this.callDispatchMiddlewareStack.register(0, require('./Middlewares/call.middleware.first.find'));

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

    this.transportServer.on(CONSTANTS.events.PING, (request, body) => {

    });

    this.ping();
    setInterval(() => this.ping(), (CONSTANTS.intervals.ping + Util.Random(CONSTANTS.intervals.threshold)))

  }

  register(name, fn) {
    this.services[name] = { fn: fn }
  };

  call(serviceName, userPayload, responseCallback) {
    this.callDispatchMiddlewareStack.apply([serviceName, userPayload, this.foreignServices, this.transportClient, responseCallback], 0)
  };

  getTransportLayer() {
    return {
      Server: this.transportServer,
      Client: this.transportClient
    }
  }

  ping() {
    machineReport((err, report) => {
      let nodes = _CONFIGURATIONS.getSystemConf().microservices;
      for (let node of nodes) {
        let options = {
          node: node,
          body: { report: report, services: Object.keys(this.services) }
        };
        this.transportClient.ping(options);
      }
    })
  }

  terminate() {
    this.transportServer.close();
  }
}

module.exports = ServiceRepository;
