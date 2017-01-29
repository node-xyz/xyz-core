const logger = require('./../../../Log/Logger')
const CONSTANTS = require('./../../../Config/Constants')
const url = require('url')

function passToRepo (params, next, end, xyz) {
  let request = params[0]
  let response = params[1]
  let body = params[2]
  let _transport = xyz.serviceRepository.transportServer

  logger.silly(`PING :: Passing ping to up to service repo`)
  _transport.emit(CONSTANTS.events.PING, body, response)
  next()
}

module.exports = passToRepo
