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

    let sendStategy = Util._require(CONFIG.getSelfConf().defaultSendStrategy)
    if (sendStategy) {
      this.callDispatchMiddlewareStack.register(0, sendStategy)
    }else {
      logger.error(`defaultSendStrategy passed to config [${sendStategy}] not found. setting the default value`)
      this.callDispatchMiddlewareStack.register(0, require('xyz.service.send.first.find'))
    }
    logger.info(`default sendStategy set to ${this.callDispatchMiddlewareStack.middlewares[0].name}`)

    this.services = new PathTree()
    this.foreignNodes = {}
    this.foreignNodes[`${CONFIG.getSelfConf().host}:${CONFIG.getSelfConf().port}`] = {}
    this.outOfReachNodes = {}

    this.INTERVALS = CONFIG.getSelfConf().intervals

    // Bind events
    this.bindTransportEvents()

    // Seed if possible
    if (CONFIG.getSelfConf().seed.length) {
      this.contactSeed(0)
    }

    // Ping Init
    this.ping()
    setInterval(() => this.ping(), (this.INTERVALS.ping + Util.Random(this.INTERVALS.threshold)))
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
        logger.verbose(`ServiceRepository received service call ${wrapper('bold', body.serviceName)}`)
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
      if (Object.keys(this.foreignNodes).indexOf(body.sender) === -1) {
        logger.warn(`new node is pinging me. adding to lists. address : ${body.sender}`)
        this.joinNode(body.sender)
      }
      logger.debug(`Responding a PING message from ${body.sender}`)
      response.end(JSON.stringify(this.services.serializedTree))
    })

    this.transportServer.on(CONSTANTS.events.JOIN, (body, response) => {
      response.end(JSON.stringify(CONFIG.getSystemConf()))
      console.log(CONFIG.getSystemConf())
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
    for (let microservice of microservices) {
      this.transportClient.ping(Util.nodeStringToObject(microservice), (err, body , res) => {
        if (err == null) {
          this.foreignNodes[microservice] = body
          this.outOfReachNodes[microservice] = 0
          logger.verbose(`${wrapper('bold', 'PING')} success :: foreignNodes = ${JSON.stringify(Object.keys(this.foreignNodes))}`)
        } else {
          if (this.outOfReachNodes[microservice]) {
            this.outOfReachNodes[microservice] += 1
            if (this.outOfReachNodes[microservice] > (this.INTERVALS.kick)) {
              logger.error(`removing node from foreignNodes and microservices list`)
              this.kickNode(microservice)
              return
            }
          }else {
            this.outOfReachNodes[microservice] = 1
          }

          logger.error(`Ping Error :: ${microservice} has been out of reach for ${this.outOfReachNodes[microservice]} pings ::  ${JSON.stringify(err)}`)
        }
      })
    }
  }

  contactSeed (idx) {
    // error. check the vlaidity of casse where 404 or no 200 is the Response
    let seeds = CONFIG.getSelfConf().seed
    this.transportClient.contactSeed(Util.nodeStringToObject(seeds[idx]), (err, body, res) => {
      if (! err) {
        logger.info(`${wrapper('bold' , 'JOINED CLUSTER')}`)
        logger.info(`Response nodes are`)
        console.log(body.microservices)
        for (let node of body.microservices) {
          this.joinNode(node)
        }
        this.ping()
      } else {
        logger.error(`${wrapper('bold', 'JOIN FAILED')} :: a seed node ${seeds[idx]} rejected with `)
        setTimeout(() => this.contactSeed(idx == seeds.length - 1 ? 0 : ++idx) , (this.INTERVALS.reconnect + Util.Random(this.INTERVALS.threshold)))
      }
    })
  }

  joinNode (aNode) {
    this.foreignNodes[aNode] = {}
    this.outOfReachNodes[aNode] = 0
    CONFIG.joinNode(aNode)
  }

  kickNode (aNode) {
    delete this.foreignNodes[aNode]
    delete this.outOfReachNodes[aNode]
    CONFIG.kickNode(aNode)
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
