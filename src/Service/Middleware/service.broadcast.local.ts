/** @module service-middlewares */

const http = require('http')

/**
 * will ignore the service path enitrely and will send the message to every
 * known host in localhost. Note that this module does not resolve path addresses
 * @function _braodcastLocal
 * @param  {Array}       params [description]
 * @param  {Function}     next   used to call the next middleware
 * @param  {Function}     done   used to end the middleware stack
 * @param  {Object}       xyz    reference to the caller's xyz instance
 */
function _broadcastLocal (params, next, done, xyz) {
  let servicePath = params[0].servicePath
  let userPayload = params[0].payload
  let responseCallback = params[1]
  let route = params[0].route
  let redirect = params[0].redirect

  let foreignNodes = xyz.serviceRepository.foreignNodes
  let transport = xyz.serviceRepository.transport
  let logger = xyz.logger
  let Path = xyz.path
  const wrapper = xyz.Util.wrapper

  let wait = 0
  let calls = []
  let responses = {}

  let matches
  const HOST = xyz.id().host
  for (let node in foreignNodes) {
    if (node.split(':')[0] === HOST) {
      calls.push({ match: servicePath, node: node })
    }
  }

  logger.verbose(`${wrapper('bold', 'BROADCAST LOCAL')} :: sending message to ${calls.map((o) => o.node + ':' + o.match)},  `)

  for (let call of calls) {
    if (responseCallback) {
      transport.send({
        route: route,
        redirect: redirect,
        node: call.node,
        payload: userPayload,
        service: call.match
      },
      function (_call, err, body, response) {
        responses[`${_call.node}:${_call.match}`] = [err, body]
        wait += 1
        if (wait === calls.length) {
          responseCallback(null, responses)
        }
      }.bind(null, call))
    } else {
      transport.send({
        route: route,
        redirect: redirect,
        node: call.node,
        payload: userPayload,
        service: call.match
      })
    }
  }

  // if no node matched
  if (!calls.length) {
    logger.warn(`BROADCAST LOCAL :: Sending a message to ${servicePath} from failed (Local Response)`)
    if (responseCallback) {
      responseCallback(http.STATUS_CODES[404], null, null)
    }
  }
}

module.exports = _broadcastLocal
