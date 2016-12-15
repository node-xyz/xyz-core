let interval = 2000
let threshold = 2000
let kick = 5

let pingBoostraper = (xyz) => {
  let XYZ = require('xyz-core')
  let Util = XYZ.Util
  let logger = XYZ.logger
  let CONFIG = XYZ.CONFIG
  let wrapper = XYZ.logUtils.wrapper
  let SR = xyz.serviceRepository

  let pingInterval = setInterval(() => {
    let nodes = CONFIG.getSystemConf().nodes
    for (let node of nodes) {
      SR.transportClient.ping(Util.nodeStringToObject(node), (err, body , res) => {
        if (err == null) {
          SR.foreignNodes[node] = body.services
          CONFIG.ensureNodes(body.nodes)
          SR.outOfReachNodes[node] = 0
          logger.verbose(`${wrapper('bold', 'PING')} success :: response = ${JSON.stringify(body)}`)
        } else {
          if (SR.outOfReachNodes[node]) {
            SR.outOfReachNodes[node] += 1
            if (SR.outOfReachNodes[node] > (kick)) {
              logger.error(`removing node from foreignNodes and nodes list`)
              SR.kickNode(node)
              return
            }
          } else {
            SR.outOfReachNodes[node] = 1
          }
          logger.error(`Ping Error :: ${node} has been out of reach for ${SR.outOfReachNodes[node]} pings ::  ${JSON.stringify(err)}`)
        }
      })
    }
  }, interval + Util.Random(threshold))
  logger.info(`ping bootstraped for approx. every ${interval} ms`)
}

module.exports = pingBoostraper
