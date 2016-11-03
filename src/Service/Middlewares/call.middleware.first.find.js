let http = require('http')
const logger = require('./../../Log/Logger')

function firstFind (params, next, done) {
  let servicePath = params[0],
    userPayload = params[1],
    foreignNodes = params[2],
    transportClient = params[3]
  responseCallback = params[4]

  let serviceTokens = servicePath.split('/')

  for (let node in foreignNodes) {
    let servicePathIndex = 0
    let pathTree = foreignNodes[node]
    while (Object.keys(pathTree).length) {
      if (pathTree[serviceTokens[servicePathIndex]]) {
        pathTree = pathTree[serviceTokens[servicePathIndex]]
        servicePathIndex += 1
      } else {
        break
      }
      if (servicePathIndex === serviceTokens.length) {
        logger.silly(`determined node by first find strategy ${node}`)
        transportClient.send(servicePath, node , userPayload, responseCallback)
        return
      }
    }
    // if no node matched
    if (responseCallback) {
      responseCallback(http.STATUS_CODES[404], null, null)
    }
  }
}

module.exports = firstFind
