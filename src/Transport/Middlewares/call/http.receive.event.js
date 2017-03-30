const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')

function _httpMessageEvent (xMessage, next, end, xyz) {
  let request = xMessage.meta.request
  let response = xMessage.response
  let body = xMessage.message
  let port = xMessage.serverId.port
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
