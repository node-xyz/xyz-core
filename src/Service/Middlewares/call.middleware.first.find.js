let http = require('http')
const logger = require('./../../Log/Logger')
const Path = require('./../path')
function firstFind (params, next, done) {
  let servicePath = params[0],
    userPayload = params[1],
    foreignNodes = params[2],
    transportClient = params[3]
  responseCallback = params[4]

  let serviceTokens = servicePath.split('/')

  for (let node in foreignNodes) {
    matches = Path.match(servicePath, foreignNodes[node])
    if (matches.length) {
      logger.debug(`FIRST FIND :: determined node for service ${servicePath} by first find strategy ${node}`)
      transportClient.send(servicePath, node , userPayload, responseCallback)
      return
    }
  }

  // if no node matched
  logger.warn(`Sending a message to ${servicePath} from first find strategy failed (Local Response)`)
  if (responseCallback) {
    responseCallback(http.STATUS_CODES[404], null, null)
  }
}

module.exports = firstFind
