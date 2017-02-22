const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')
const url = require('url')

function _udpEvent (params, next, end, xyz) {
  let message = params[0]
  let port = params[2]
  let _transport = xyz.serviceRepository.transport.servers[port]
  let msgToSR = {
    userPayload: message.json.userPayload,
    service: message.json.service
  }
  logger.debug(`UDP receive emitter :: Passing message from ${params[1]} up to service repo with ${JSON.stringify(msgToSR)}`)
  _transport.emit(
    CONSTANTS.events.MESSAGE, msgToSR)
  next()
}

module.exports = _udpEvent
