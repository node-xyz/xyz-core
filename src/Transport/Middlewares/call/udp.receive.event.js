const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')

function _udpEvent (xMessage, next, end, xyz) {
  let message = xMessage.message
  let port = xMessage.serverId.port
  let _transport = xyz.serviceRepository.transport.servers[port]

  console.log(xMessage)
  let msgToSR = {
    userPayload: message.json.userPayload,
    service: message.json.service
  }

  logger.debug(`UDP receive emitter :: Passing message from ${xMessage.message.senderId} up to service repo with ${JSON.stringify(msgToSR)}`)
  _transport.emit(
    CONSTANTS.events.MESSAGE, msgToSR)
  next()
}

module.exports = _udpEvent
