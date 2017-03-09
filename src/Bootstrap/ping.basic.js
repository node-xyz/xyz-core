let interval = 2000
let threshold = 2000
let kick = 10
const GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')
const _httpExport = require('./../Transport/Middlewares/call/http.export.middleware')

let _basicPingBootstrap = (xyz, event, port) => {
  let Util = xyz.Util
  let wrapper = Util.wrapper
  let logger = xyz.logger
  let CONFIG = xyz.CONFIG
  const CONSTANTS = xyz.CONSTANTS

  let SR = xyz.serviceRepository
  let transport = SR.transport
  const _id = `${xyz.id().host}:${xyz.id().port}`

  let joinCandidate = []

  let seeds = CONFIG.getSelfConf().seed
  function contactSeed (idx) {
    transport.send({node: seeds[idx], payload: {id: _id}, route: 'PING'}, (err, body, res) => {
      if (!err) {
        logger.info(`${wrapper('bold', 'JOIN PING ACCEPTED')}. response : ${JSON.stringify(body)}`)
        for (let node of body.nodes) {
          SR.joinNode(node)
        }
        // no need to do this. guess why :D
        // this.joinNode(seeds[idx])
      } else {
        logger.error(`${wrapper('bold', 'JOIN PING REJECTED')} :: seed node ${seeds[idx]} rejected with `)
        setTimeout(() => contactSeed(idx === seeds.length - 1 ? 0 : ++idx), interval + Util.Random(threshold))
      }
    })
  }

  function _ping () {
    let nodes = CONFIG.getSystemConf().nodes
    for (let node of nodes) {
      SR.transport.send({
        route: 'PING',
        node: node,
        payload: {id: _id}
      }, (err, body, res) => {
        if (err == null) {
          SR.foreignNodes[node] = body.services
          SR.foreignRoutes[node] = body.transportServers

          for (let tempNode of body.nodes) {
            if (nodes.indexOf(tempNode) === -1) {
              logger.warn(`PING :: new join candidate suggested by ${node} : {${tempNode}}`)
              joinCandidate.push(tempNode)
            }
          }

          // but we trust the callee 100% so we set it's availability to full
          SR.outOfReachNodes[node] = 0
          logger.silly(`PING  :: response = ${JSON.stringify(body)}`)
        } else {
          if (SR.outOfReachNodes[node]) {
            if (SR.outOfReachNodes[node] >= kick) {
              logger.error(`PING :: removing node {${node}} from foreignNodes and nodes list`)
              SR.kickNode(node)
              return
            }
            SR.outOfReachNodes[node] += 1
          } else {
            SR.outOfReachNodes[node] = 1
          }
          logger.error(`Ping Error :: ${node} has been out of reach for ${SR.outOfReachNodes[node]} pings ::  ${JSON.stringify(err)}`)
        }
      })
    }

    for (let cNode of joinCandidate) {
      if (cNode) {
        SR.transport.send({node: cNode, route: 'PING', payload: {id: _id}}, (err, body, res) => {
          // this candidate has failed to prove itself
          if (err) {
            logger.error(`join candidate ${cNode} rejected due to ${err}`)
          } else {
            // note that we do not use the body (services) here.
            // we wait until the next ping round for double check
            SR.joinNode(cNode)
          }
          joinCandidate.splice(joinCandidate.indexOf(cNode), 1)
        })
      }
    }
  }

  function onPingReceive (body, response) {
    logger.debug(`PING message received with ${JSON.stringify(body)}`)
    if (CONFIG.getSystemConf().nodes.indexOf(body.id) === -1) {
      logger.warn(`new node is pinging me. adding to joinCandidate list. address : ${body.id}`)
      joinCandidate.push(body.id)
    }
    response.end(JSON.stringify({
      services: SR.services.serializedTree,
      nodes: CONFIG.getSystemConf().nodes,
      transportServers: SR.transport.getServerRoutes()}))
  }

  function _pingEvent (params, next, end, xyz) {
    // let request = params[0]
    let response = params[1]
    let body = params[2]
    let _transport = xyz.serviceRepository.transport.servers[port]

    logger.silly('PING :: Passing ping to up to service repo')
    _transport.emit(CONSTANTS.events.PING, body, response)
    next()
  }

  setInterval(_ping, interval + Util.Random(threshold))

  // bind listener
  let pingReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'ping.receive.mw', 'PING')
  let pingDispatchMiddlewareStack = new GenericMiddlewareHandler(xyz, 'ping.dispatch.mw', 'PING')
  pingReceiveMiddlewareStack.register(0, _pingEvent)
  pingDispatchMiddlewareStack.register(0, _httpExport)

  SR.transport.registerRoute('PING', pingDispatchMiddlewareStack)
  SR.transport.servers[port].registerRoute('PING', pingReceiveMiddlewareStack)

  SR.transport.servers[port].on(CONSTANTS.events.PING, onPingReceive)

  logger.info(`default ping bootstraped for approx. every ${interval} ms`)

  if (event) {
    logger.info('ipc channel created from default ping')
    process.on('message', (data) => {
      if (data.title === 'pingRate') {
        process.send({
          title: data.title,
          body: {interval: interval, maxInterval: interval, minInterval: interval}
        })
      }
    })
  }

  _ping()

  if (seeds.length) {
    contactSeed(0)
  }
}

module.exports = _basicPingBootstrap
