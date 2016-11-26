let http = require('http')
let HTTP = require('../Transport/Transport').HTTP
let CONSTANTS = require('../Config/Constants')
let GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')
let CONFIG = require('./../Config/config.global')
const XResponse = require('../Transport/XResponse')
const logger = require('./../Log/Logger')
const Util = require('./../Util/Util')
let machineReport = require('./../Util/machine.reporter')
const PathTree = require('./path.tree')
const Path = require('./path')
const wrapper = require('./../Util/ansi.colors').wrapper

class ServiceRepository {
  /**
   * Create a service repository object
   * Transport client and server will be composed by ServiceRepository
   */

  /**
   * Creates a new ServiceRepository
   * Request ( call ) and Ping Events are bounded to this object
   */
  constructor () {
    this.transportServer = new HTTP.Server()
    this.transportClient = new HTTP.Client()

    this.callDispatchMiddlewareStack = new GenericMiddlewareHandler()

    this.services = new PathTree()
    this.foreignNodes = {}

    // Bind events
    this.bindTransportEvents()

    // Seed if possible
    if (CONFIG.getSelfConf().seed) {
      this.contactSeed(0)
    }

    // add yourself
    CONFIG.ensureSelf()

    // Ping Init
    this.ping()
    setInterval(() => this.ping(), (CONSTANTS.intervals.ping + Util.Random(CONSTANTS.intervals.threshold)))
  }

  /**
   * Register a new service. The new service will be stored inside an object
   * @param  {String}   path path of the service. the call request must have the same path. path should strat with a /
   * @param  {Function} fn   function to be called when a request to this service arrives
   * ## Note the format of this funciton is changing at the current stages of development
   */
  register (path, fn) {
    this.services.createPathSubtree(path, fn)
  }

  bindTransportEvents () {
    this.transportServer.on(CONSTANTS.events.REQUEST, (body, response) => {
      let fn = this.services.getPathFunction(body.serviceName)
      if (fn) {
        logger.debug(`ServiceRepository received service call ${body.serviceName}`)
        fn(body.userPayload, new XResponse(response))
        return
      }else {
        // this will be rarely reached . most of the time callDisplatchfind middleware will find this.
        // Same problem as explained in TEST/Transport.middleware => early response
        response.writeHead(404, {})
        response.end(JSON.stringify({userPayload: http.STATUS_CODES[404]}))
      }
    })

    this.transportServer.on(CONSTANTS.events.PING, (body, response) => {
      logger.debug(`Responding a PING message from ${body.sender}`)
      if (Object.keys(this.foreignNodes).indexOf(body.sender) === -1) {
        logger.warn(`new node is pinging me. adding to foreignNodes list. address : ${body.sender}`)
        this.foreignNodes[body.sender] = {}
        CONFIG.joinNode({host: body.sender.split(':')[0], port: body.sender.split(':')[1]})
      }
      response.end(JSON.stringify(this.services.serializedTree))
    })

    this.transportServer.on(CONSTANTS.events.JOIN, (body, response) => {
      CONFIG.joinNode({host: body.sender.split(':')[0], port: body.sender.split(':')[1]})
      response.end(JSON.stringify(CONFIG.getSystemConf()))
    })
  }

  /**
   * Call a service. A middleware will be called with aproppiate arguments to find the receiving service etc.
   * @param  {String} serviceName      name of the service
   * @param  {Object|String|Number|Array} userPayload      payload to be passed to the receiving service
   * @param  {Function} responseCallback              Optional callback to handle the response
   */
  call (servicePath, userPayload, responseCallback) {
    this.callDispatchMiddlewareStack.apply([Path.format(servicePath), userPayload, this.foreignNodes, this.transportClient, responseCallback], 0)
  }

  ping () {
    let microservices = CONFIG.getSystemConf().microservices
    console.log(microservices)
    for (let microservice of microservices) {
      this.transportClient.ping(microservice, (body , res) => {
        if (res.statusCode === 200) {
          this.foreignNodes[`${microservice.host}:${microservice.port}`] = body
          logger.debug(`${wrapper('bold', 'PING')} success :: foreignNodes = ${JSON.stringify(this.foreignNodes)}`)
        } else {
          delete this.foreignNodes[`${microservice.host}:${microservice.port}`]
          logger.error(`Ping Error :: ${JSON.stringify(err)}`)
        }
      })
    }
  }

  contactSeed (idx) {
    let seeds = CONFIG.getSelfConf().seed
    this.transportClient.contactSeed(seeds[idx], (body, res) => {
      if (!body) {
        setTimeout(() => this.contactSeed(idx == seeds.length - 1 ? 0 : ++idx) , (CONSTANTS.intervals.reconnect + Util.Random(CONSTANTS.intervals.threshold)))
      }else {
        if (res.statusCode === 200) {
          for (let node of body.microservices) {
            CONFIG.joinNode(node)
          }
          logger.info(`${wrapper('bold' , 'JOINED CLUSTER')}`)
          logger.info(`Response nodes are ${body.microservices}`)
          this.ping()
        }else {
          setTimeout(() => this.contactSeed(idx == seeds.length - 1 ? 0 : ++idx) , (CONSTANTS.intervals.reconnect + Util.Random(CONSTANTS.intervals.threshold)))
        }
      }
    })
  }

  // TODO redundant
  getTransportLayer () {
    return {
      Server: this.transportServer,
      Client: this.transportClient
    }
  }

  terminate () {
    this.transportServer.close()
  }
}

module.exports = ServiceRepository
