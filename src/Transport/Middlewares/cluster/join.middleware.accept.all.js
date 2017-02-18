const logger = require('./../../../Log/Logger')
const wrapper = require('./../../../Util/Util').wrapper
const CONSTANTS = require('./../../../Config/Constants')
function joinAcceptAll (params, next, end, xyz) {
  let request = params[0]
  let response = params[1]
  let body = params[2]
  let port = params[3]
  let _transport = xyz.serviceRepository.transport.servers[port]

  logger.info(`${wrapper('bold', 'JOIN REQUEST RECEIVED | TRANSPORT')} ::passsign join request from ${JSON.stringify(body)} to service reportory layer)`)

  _transport.emit(CONSTANTS.events.JOIN, body, response)

  end()
}

module.exports = joinAcceptAll
