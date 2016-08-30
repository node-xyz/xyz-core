let http = require('http')
const logger = require('./../../Log/Logger')

function firstFind (params, next, done) {
  let serviceName = params[0],
    userPayload = params[1],
    foreignServices = params[2],
    transportClient = params[3]
  responseCallback = params[4]

  for (let node in foreignServices) {
    let index = foreignServices[node].indexOf(serviceName)
    if (index > -1) {
      logger.silly(`determined node by first find strategy ${node}`)
      transportClient.send(serviceName, node , userPayload, responseCallback)
      return
    }
  }
  if (responseCallback) {
    responseCallback(http.STATUS_CODES[404], null, null)
  }
}

module.exports = firstFind
