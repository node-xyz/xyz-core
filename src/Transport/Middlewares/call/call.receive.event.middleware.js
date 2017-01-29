const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')
const url = require('url')

function passToRepo (params, next, end, xyz) {
  let request = params[0]
  let response = params[1]
  let body = params[2]
  let _transport = xyz.serviceRepository.transportServer

  logger.debug(`CALL :: Passing request to ${request.url} up to service repo with ${body}`)
  _transport.emit(
    CONSTANTS.events.REQUEST, {
      userPayload: body.userPayload,
      serviceName: body.service
    },
    response)
  next()
}

module.exports = passToRepo
