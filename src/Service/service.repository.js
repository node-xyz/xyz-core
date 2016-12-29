// Service Repository
//
// This module handles service dependant tasks such as managing list of other services
// and their functions, keeping track of other nodes, performing ping etc.
//
// Note that any code and function regarding the calls should be inside undelying transportClient and
// transportServer

let http = require('http')
let HTTP = require('../Transport/Transport').HTTP
let CONSTANTS = require('../Config/Constants')
let GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')
let CONFIG = require('./../Config/config.global')
const XResponse = require('../Transport/XResponse')
const logger = require('./../Log/Logger')
const Util = require('./../Util/Util')
const PathTree = require('./path.tree')
const Path = require('./path')
const wrapper = require('./../Util/Util').wrapper
const EventEmitter = require('events')

class ServiceRepository extends EventEmitter {

  //  Creates a new ServiceRepository
  //  Request ( call ) and Ping Events are bounded to this object
  //  Transport client and server will be composed by ServiceRepository
  constructor (xyz) {
    super()

    // note that a ref. to xyz will be passed all the way down. this is to ensure that
    // every middleware will have access to it and
    // there will be no circular dependency
    this.transportServer = new HTTP.Server(xyz)
    this.transportClient = new HTTP.Client(xyz)

    this.callDispatchMiddlewareStack = new GenericMiddlewareHandler(xyz, 'callDispatchMiddlewareStack')

    // note that this can be either string or `require`
    let sendStategy = Util._require(CONFIG.getSelfConf().defaultSendStrategy)
    if (sendStategy) {
      this.callDispatchMiddlewareStack.register(0, sendStategy)
    }else {
      logger.error(`defaultSendStrategy passed to config [${sendStategy}] not found. setting the default value`)
      this.callDispatchMiddlewareStack.register(0, require('xyz.service.send.first.find'))
    }
    logger.info(`default sendStategy set to ${this.callDispatchMiddlewareStack.middlewares[0].name}`)

    // list of current services
    this.services = new PathTree()

    // list of foreign nodes and services respectively
    this.foreignNodes = {}
    this.foreignNodes[`${CONFIG.getSelfConf().host}:${CONFIG.getSelfConf().port}`] = {}
    this.outOfReachNodes = {}
    this.xyz = xyz

    this.INTERVALS = CONFIG.getSelfConf().intervals

    // Bind events
    this.bindTransportEvents()

    // Seed if possible
    if (CONFIG.getSelfConf().seed.length) {
      this.contactSeed(0)
    }
  }

  //  Register a new service at a given path.
  //  The first parameter `path` will indicate the path of the service. Note that this path must be valid.
  register (path, fn) {
    this.services.createPathSubtree(path, fn)
  }

  _inspect () {
    let str = `
${wrapper('green', wrapper('bold', 'Middlewares'))}:
  ${this.callDispatchMiddlewareStack._inspect()}
${wrapper('green', wrapper('bold', 'Services'))}:
`

    for (let s of this.services.plainTree) {
      str += `  ${s.name} @ ${s.path}
`
    }

    str += JSON.stringify(this.foreignNodes)
    return str
  }

  // Bind all of the events fromm the transport client.
  // All of these should happen as the module loads.
  bindTransportEvents () {
    this.transportServer.on(CONSTANTS.events.REQUEST, (body, response) => {
      this.emit('request:receive', {body: body})
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

    /*DEPRACATED
    this.transportServer.on(CONSTANTS.events.PING, (body, response) => {
      if (Object.keys(this.foreignNodes).indexOf(body.sender) === -1) {
        logger.warn(`new node is pinging me. adding to lists. address : ${body.sender}`)
        this.joinNode(body.sender)
      }
      logger.debug(`Responding a PING message from ${body.sender}`)
      response.end(JSON.stringify({services: this.services.serializedTree, nodes: CONFIG.getSystemConf().nodes }))
    })*/

    this.transportServer.on(CONSTANTS.events.JOIN, (body, response) => {
      response.end(JSON.stringify(CONFIG.getSystemConf()))
    })
  }

  // Call a service. A middleware will be called with aproppiate arguments to find the receiving service etc.
  // Details about the arguments in <a href="xyz.html"> xyz.js </a>
  // TODO: in this case, unlike in config, sendStrategy MUST be a function
  // better to allow string as well
  call (opt, responseCallback) {
    opt.payload = opt.payload || null
    if (opt.sendStrategy) {
      // this is trying to imitate the middleware signiture
      opt.sendStrategy([Path.format(opt.servicePath), opt.payload, this.foreignNodes, this.transportClient, responseCallback], null, null, this.xyz)
    }else {
      this.callDispatchMiddlewareStack.apply([Path.format(opt.servicePath), opt.payload, this.foreignNodes, this.transportClient, responseCallback], 0)
    }
  }

  // this is DEPRECATED and a bootstrap function is used instead.
  // We're gonna keep the code for now
  ping () {
    let nodes = CONFIG.getSystemConf().nodes
    for (let node of nodes) {
      this.transportClient.ping(Util.nodeStringToObject(node), (err, body , res) => {
        if (err == null) {
          this.foreignNodes[node] = body.services
          CONFIG.ensureNodes(body.nodes)
          this.outOfReachNodes[node] = 0
          logger.debug(`${wrapper('bold', 'PING')} success :: response = ${JSON.stringify(body)}`)
        } else {
          if (this.outOfReachNodes[node]) {
            this.outOfReachNodes[node] += 1
            if (this.outOfReachNodes[node] > (this.INTERVALS.kick)) {
              logger.error(`removing node from foreignNodes and nodes list`)
              this.kickNode(node)
              return
            }
          } else {
            this.outOfReachNodes[node] = 1
          }
          logger.error(`Ping Error :: ${node} has been out of reach for ${this.outOfReachNodes[node]} pings ::  ${JSON.stringify(err)}`)
        }
      })
    }
  }

  contactSeed (idx) {
    // error. check the vlaidity of casse where 404 or no 200 is the Response
    let seeds = CONFIG.getSelfConf().seed
    this.transportClient.contactSeed(Util.nodeStringToObject(seeds[idx]), (err, body, res) => {
      if (! err) {
        this.emit('cluster:join')
        logger.info(`${wrapper('bold' , 'JOINED CLUSTER')}`)
        logger.debug(`Response nodes are ${body.nodes}`)
        for (let node of body.nodes) {
          this.joinNode(node)
        }
        this.ping()
      } else {
        logger.error(`${wrapper('bold', 'JOIN FAILED')} :: a seed node ${seeds[idx]} rejected with `)
        setTimeout(() => this.contactSeed(idx == seeds.length - 1 ? 0 : ++idx) , this.INTERVALS.reconnect)
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
    clearInterval(this.pingInterval)
  }
}

module.exports = ServiceRepository
