const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')

function _udpEvent (xMessage, next, end, xyz) {
  let message = xMessage.message
  let port = xMessage.serverId.port
  let _transport = xyz.serviceRepository.transport.servers[port]

  let msgToSR = {
    userPayload: message.userPayload,
    service: message.xyzPayload.service
  }

  logger.debug(`UDP receive emitter :: Passing message from ${xMessage.message.senderId} up to service repo with ${JSON.stringify(msgToSR)}`)
  _transport.emit(
    CONSTANTS.events.MESSAGE, msgToSR)
  next()
}

module.exports = _udpEvent
