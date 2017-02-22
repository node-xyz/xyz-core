// Service Repository
//
// This module handles service dependant tasks such as managing list of other services
// and their functions, keeping track of other nodes, performing ping etc.
//
// Note that any code and function regarding the calls
// should be inside undelying transportClient and
// transportServer

let http = require('http')
const Transport = require('./../Transport/Transport')
let UDP = require('../Transport/Transport').UDP
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
    this.transport = new Transport(xyz)
    this.selfConf = CONFIG.getSelfConf()

    for (let t of this.selfConf.transport) {
      this.registerServer(t.type, t.port, true)
    }

    this.callDispatchMiddlewareStack = new GenericMiddlewareHandler(xyz, 'callDispatchMiddlewareStack')

    // note that this can be either string or `require`
    let sendStategy = Util._require(CONFIG.getSelfConf().defaultSendStrategy)
    if (sendStategy) {
      this.callDispatchMiddlewareStack.register(0, sendStategy)
    } else {
      logger.error(`defaultSendStrategy passed to config [${sendStategy}] not found. setting the default value`)
      this.callDispatchMiddlewareStack.register(0, require('xyz.service.send.first.find'))
    }
    logger.info(`default sendStategy set to ${this.callDispatchMiddlewareStack.middlewares[0].name}`)

    // list of current services
    this.services = new PathTree()
    this._id = CONFIG.getSelfConf().host + ':' + CONFIG.getSelfConf().transport[0].port

    // list of foreign nodes and services respectively
    this.foreignNodes = {}
    this.foreignNodes[`${xyz.id().host}:${xyz.id().port}`] = {}
    this.outOfReachNodes = {}
    this.foreignRoutes = {}
    this.xyz = xyz

    this.INTERVALS = CONFIG.getSelfConf().intervals

    // Bind events
    // this.bindTransportEvents()

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

  inspect () {
    let str = `
${wrapper('green', wrapper('bold', 'Middlewares'))}:
  ${this.callDispatchMiddlewareStack.inspect()}
${wrapper('green', wrapper('bold', 'Services'))}:\n`

    for (let s of this.services.plainTree) {
      str += `  ${s.name} @ ${s.path}\n`
    }
    return str
  }

  inspectJSON () {
    return {
      services: this.services.plainTree,
      middlewares: [this.callDispatchMiddlewareStack.inspectJSON()]
    }
  }

  _bindTransportEvent (server) {
    server.on(CONSTANTS.events.MESSAGE, (body, response) => {
      this.emit('message:receive', {body: body})
      let fn = this.services.getPathFunction(body.service)
      if (fn) {
        logger.verbose(`ServiceRepository received service call ${wrapper('bold', body.service)}`)
        fn(body.userPayload, response)
        return
      } else {
        // this will be rarely reached . most of the time callDisplatchfind middleware will find this.
        // Same problem as explained in TEST/Transport.middleware => early response
        response.writeHead(404, {})
        response.end(JSON.stringify(http.STATUS_CODES[404]))
      }
    })

    // server.on(CONSTANTS.events.JOIN, (body, response) => {
    //   this.emit('cluster:join', {body: body})
    //   response.end(JSON.stringify(CONFIG.getSystemConf()))
    // })
  }

  // Call a service. A middleware will be called with aproppiate arguments to find the receiving service etc.
  // Details about the arguments in <a href="xyz.html"> xyz.js </a>
  // TODO: in this case, unlike in config, sendStrategy MUST be a function
  // better to allow string as well
  call (opt, responseCallback) {
    this.emit('message:send', {opt: opt})
    opt.payload = opt.payload || null
    opt.servicePath = Path.format(opt.servicePath)
    opt.route = opt.route || 'CALL'
    opt.redirect = opt.redirect || false

    if (opt.sendStrategy) {
      // this is trying to imitate the middleware signature
      opt.sendStrategy([opt, responseCallback], null, null, this.xyz)
    } else {
      this.callDispatchMiddlewareStack.apply([opt, responseCallback], 0)
    }
  }

  contactSeed (idx) {
    // error. check the vlaidity of casse where 404 or no 200 is the Response
    let seeds = CONFIG.getSelfConf().seed
    this.transport.send({node: seeds[idx], payload: {id: this._id}, route: 'PING'}, (err, body, res) => {
      if (!err) {
        logger.info(`${wrapper('bold', 'JOIN PING ACCEPTED')}. response : ${JSON.stringify(body)}`)
        for (let node of body.nodes) {
          this.joinNode(node)
        }
        // no need to do this. guess why :D
        // this.joinNode(seeds[idx])
      } else {
        logger.error(`${wrapper('bold', 'JOIN PING REJECTED')} :: seed node ${seeds[idx]} rejected with `)
        setTimeout(() => this.contactSeed(idx == seeds.length - 1 ? 0 : ++idx), this.INTERVALS.reconnect)
      }
    })
  }

  // it is VERY important to use this method when adding new servers at
  // tuntime. This is because from here, we can add bindings to receive
  // messages in this server
  registerServer (type, port, e) {
    let s = this.transport.registerServer(type, port, e)
    if (s) {
      logger.info(`new transport server [${type}] bounded on port ${port}`)
      if (e) {
        this._bindTransportEvent(s)
      }
    }
  }

  joinNode (aNode) {
    this.foreignNodes[aNode] = {}
    this.outOfReachNodes[aNode] = 0
    CONFIG.joinNode(aNode)
  }

  kickNode (aNode) {
    // we will not assume that this node has any function anymore
    delete this.foreignNodes[aNode]
    CONFIG.kickNode(aNode)
  }

  terminate () {
    for (let s in this.transport.servers) {
      logger.warn(`sutting down server ${s}`)
      this.transport.servers[s].close()
    }
  }
}

module.exports = ServiceRepository
