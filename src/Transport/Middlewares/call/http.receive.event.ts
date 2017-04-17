const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')

function _httpMessageEvent (xMessage, next, end, xyz) {
  let request = xMessage.meta.request
  let message = xMessage.message
  let port = xMessage.serverId.port
  let _transport = xyz.serviceRepository.transport.servers[port]

  logger.debug(`HTTP Receive emitter :: Passing request to ${request.url} up to service repo with ${JSON.stringify(message)}`)
  _transport.emit(
    CONSTANTS.events.MESSAGE, xMessage)
  next()
}

module.exports = _httpMessageEvent
