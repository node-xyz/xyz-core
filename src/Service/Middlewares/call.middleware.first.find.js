let http = require('http')
const logger = require('./../../Log/Logger')

function firstFind (params, next, done) {
  let serviceName = params[0],
    userPayload = params[1],
    foreignMicroservices = params[2],
    transportClient = params[3]
  responseCallback = params[4]

  for (let microservice in foreignMicroservices) {
    let index = foreignServices[microservice].indexOf(serviceName)
    if (index > -1) {
      logger.silly(`determined target microservice by first find strategy ${microservice}`)
      transportClient.send(serviceName, microservice , userPayload, responseCallback)
      return
    }
  }
  if (responseCallback) {
    responseCallback(http.STATUS_CODES[404], null, null)
  }
}

module.exports = firstFind
