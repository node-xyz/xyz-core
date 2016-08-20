const logger = require('./../../../Log/Logger')

let pingDispatchLogger = function (params, next, end) {
  let requestConfig = params[0]
  logger.debug(`Sendign PING to ${requestConfig.uri} with Config : ${JSON.stringify(params[0])}`)
  next()
}

module.exports = pingDispatchLogger
