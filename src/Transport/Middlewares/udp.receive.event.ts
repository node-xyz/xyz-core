import {logger} from './../../Log/Logger'
import {CONSTANTS} from './../../Config/Constants'


export function _udpEvent (xMessage, next, end, xyz) {
  let message = xMessage.message
  let port = xMessage.serverId.port
  let _transport = xyz.serviceRepository.transport.servers[port]

  logger.debug(`UDP receive emitter :: Passing message from ${xMessage.message.xyzPayload.senderId} up to service repo with ${JSON.stringify(xMessage.message.userPayload)}`)
  _transport.emit(
    CONSTANTS.events.MESSAGE, xMessage)
  next()
}
