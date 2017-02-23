let http = require('http')

function firstFind (params, next, done, xyz) {
  let servicePath = params[0].servicePath,
    userPayload = params[0].payload,
    responseCallback = params[1],
    route = params[0].route

  foreignNodes = xyz.serviceRepository.foreignNodes,
    transport = xyz.serviceRepository.transport

  let logger = xyz.logger
  let wrapper = xyz.Util.wrapper
  let Path = xyz.path

  let serviceTokens = servicePath.split('/')

  for (let node in foreignNodes) {
    matches = Path.match(servicePath, foreignNodes[node])
    if (matches.length) {
      logger.verbose(`${wrapper('bold', 'FIRST FIND')} :: determined node for service ${wrapper('bold', servicePath)} by first find strategy : ${wrapper('bold', node + ':' + matches[0])}`)
      transport.send({
        redirect: params[0].redirect,
        node: node,
        route: route,
        payload: {userPayload: userPayload, service: matches[0]}}, responseCallback)
      done()
      return
    }
  }

  // if no node matched
  logger.warn(`Sending a message to ${servicePath} from first find strategy failed (Local Response)`)
  if (responseCallback) {
    responseCallback(http.STATUS_CODES[404], null, null)
    done()
    return
  }
}

module.exports = firstFind
