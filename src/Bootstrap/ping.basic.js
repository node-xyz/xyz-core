let interval = 2000
let threshold = 2000
let kick = 5
const GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler')
const _httpExport = require('./../Transport/Middlewares/call/http.export.middleware')

let pingBoostraper = (xyz, event, port) => {
  let Util = xyz.Util
  let logger = xyz.logger
  let CONFIG = xyz.CONFIG
  const CONSTANTS = xyz.CONSTANTS
  let wrapper = xyz.Util.wrapper

  let SR = xyz.serviceRepository
  const _id = `${xyz.id().host}:${xyz.id().port}`

  let joinCandidate = []

  function _ping () {
    let nodes = CONFIG.getSystemConf().nodes
    for (let node of nodes) {
      SR.transport.send({
        route: 'PING',
        node: node,
        payload: {id: _id }}, (err, body, res) => {
        if (err == null) {
          SR.foreignNodes[node] = body.services
          SR.foreignRoutes[node] = body.transportServers

          for (let tempNode of body.nodes) {
            if (nodes.indexOf(tempNode) === -1) {
              logger.warn(`new join candidate suggested by ${node} : {${tempNode}}`)
              joinCandidate.push(tempNode)
            }
          }

          // but we trust the callee 100% so we set it's availability to full
          SR.outOfReachNodes[node] = 0
          logger.silly(`PING  :: response = ${JSON.stringify(body)}`)
        } else {
          if (SR.outOfReachNodes[node]) {
            if (SR.outOfReachNodes[node] === (kick) && SR.foreignNodes[node]) {
              logger.error(`removing node {${node}} from foreignNodes and nodes list`)
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
        SR.transport.send({ node: cNode, route: 'PING', payload: {id: _id}}, (err, body, res) => {
          // this candidate has failed to prove itself
          if (err) {
            logger.error(`join candidate ${cNode} rejected due to ${err}`)
          } else {
            // note that we do not use the body (services) here.
            // we wait until the next ping round for double check
            CONFIG.joinNode(cNode)
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
    let request = params[0]
    let response = params[1]
    let body = params[2]
    let _transport = xyz.serviceRepository.transport.servers[port]

    logger.silly(`PING :: Passing ping to up to service repo`)
    _transport.emit(CONSTANTS.events.PING, body, response)
    next()
  }

  let pingInterval = setInterval(_ping, interval + Util.Random(threshold))

  // bind listener
  let pingReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'pingReceiveMiddlewareStack', 'PING')
  let pingDispatchMiddlewareStack = new GenericMiddlewareHandler(xyz, 'pingDispatchMiddlewareStack', 'PING')
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
          body: {interval: interval, maxInterval: interval, minInterval: interval }
        })
      }
    })
  }

  _ping()
}

module.exports = pingBoostraper
