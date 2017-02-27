const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')

function _httpMessageEvent (params, next, end, xyz) {
  let request = params[0]
  let response = params[1]
  let body = params[2]
  let port = params[3]
  let _transport = xyz.serviceRepository.transport.servers[port]

  logger.debug(`HTTP Receive emitter :: Passing request to ${request.url} up to service repo with ${JSON.stringify(body)}`)
  _transport.emit(
    CONSTANTS.events.MESSAGE, {
      userPayload: body.userPayload,
      service: body.service
    },
    response)
  next()
}

module.exports = _httpMessageEvent
