const logger = require('./../../Log/Logger')
const wrapper = require('./../../Util/ansi.colors').wrapper

function globalReceiveLogger(params, next, end) {
  let request = params[0]
  let response = params[1]
  let body = params[2]
  let _transport = params[3]

  logger.verbose(`${wrapper('bold', 'LOGGER')} | request Receive at ${request.url} | body is ${JSON.stringify(body)}`)
  next()
}

module.exports = globalReceiveLogger
