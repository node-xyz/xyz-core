const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')

function _httpMessageEvent (xMessage, next, end, xyz) {
  let request = xMessage.meta.request
  let response = xMessage.response
  let message = xMessage.message
  let port = xMessage.serverId.port
  let _transport = xyz.serviceRepository.transport.servers[port]

  let _msgToService = {
    userPayload: message.userPayload,
    service: message.xyzPayload.service
  }

  console.log(_msgToService)
  logger.debug(`HTTP Receive emitter :: Passing request to ${request.url} up to service repo with ${JSON.stringify(message)}`)
  _transport.emit(
    CONSTANTS.events.MESSAGE, _msgToService, response)
  next()
}

module.exports = _httpMessageEvent
