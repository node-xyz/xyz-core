let http = require('http');
let HTTP = require('../Transport/Transport').HTTP;
let CONSTANTS = require('../Config/Constants');
let GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')
let _CONFIGURATIONS = require('./../Config/config.global');
const XResponse = require('../Transport/XResponse');
const logger = require('./../Log/Logger');
const Util = require('./../Util/Util');
let machineReport = require('./../Util/machine.reporter');

class ServiceRepository {
  constructor() {

    this.transportServer = new HTTP.Server();
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
      // this will be barely reached . most of the time callDisplatchfind middleware will find this.
      response.writeHead(404, {});
      response.end(http.STATUS_CODES[404]);
    });

    this.transportServer.on(CONSTANTS.events.PING, (body, response) => {
      response.end(JSON.stringify(Object.keys(this.services)));
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

  emit(eventName, userPayload) {
    let nodes = _CONFIGURATIONS.microservices;
    for (let node of nodes) {


    }
  }

  ping() {
    let nodes = _CONFIGURATIONS.getSystemConf().microservices;
    for (let node of nodes) {
      this.transportClient.ping(node, (err, response, body) => {
        if (err) {
          logger.error(`Ping Error :: ${JSON.stringify(err)}`);
        } else {
          logger.silly(`PING success :: foreignServices = ${JSON.stringify(this.foreignServices)}`)
          this.foreignServices[`${node.host}:${node.port}`] = body;
        }
      });
    }
  }

  getTransportLayer() {
    return {
      Server: this.transportServer,
      Client: this.transportClient
    }
  }

  terminate() {
    this.transportServer.close();
  }
}

module.exports = ServiceRepository;
