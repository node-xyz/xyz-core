let http = require('http')

function firstFind (params, next, done, xyz) {
  let servicePath = params[0].servicePath
  let userPayload = params[0].payload
  let responseCallback = params[1]
  let route = params[0].route

  let foreignNodes = xyz.serviceRepository.foreignNodes
  let transport = xyz.serviceRepository.transport

  let logger = xyz.logger
  let wrapper = xyz.Util.wrapper
  let Path = xyz.path

  // not used, but good to know sth like this exists!
  // let serviceTokens = servicePath.split('/')

  let matches
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
