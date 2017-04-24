Object.defineProperty(exports, '__esModule', { value: true })
var Logger_1 = require('./../../Log/Logger')
var Constants_1 = require('./../../Config/Constants')
function _udpEvent (xMessage, next, end, xyz) {
  var message = xMessage.message
  var port = xMessage.serverId.port
  var _transport = xyz.serviceRepository.transport.servers[port]
  Logger_1.logger.debug('UDP receive emitter :: Passing message from ' + xMessage.message.xyzPayload.senderId + ' up to service repo with ' + JSON.stringify(xMessage.message.userPayload))
  _transport.emit(Constants_1.CONSTANTS.events.MESSAGE, xMessage)
  next()
}
exports._udpEvent = _udpEvent
