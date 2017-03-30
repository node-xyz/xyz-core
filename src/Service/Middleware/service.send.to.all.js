/** @module service-middlewares */

const http = require('http')

/**
 * Will resolve the service path to an array of nodes that can responde to
 * the target path given. It will then send the message to all of the
 * node in the array.
 * @method _sendToAll
 * @param  {Array}       params [description]
 * @param  {Function}     next   used to call the next middleware
 * @param  {Function}     done   used to end the middleware stack
 * @param  {Object}       xyz    reference to the caller's xyz instance
 */
function _sendToAll (params, next, done, xyz) {
  let servicePath = params[0].servicePath
  let userPayload = params[0].payload
  let responseCallback = params[1]
  let route = params[0].route
  let redirect = params[0].redirect

  let foreignNodes = xyz.serviceRepository.foreignNodes
  let transport = xyz.serviceRepository.transport
  let logger = xyz.logger
  let Path = xyz.path
  let wrapper = xyz.Util.wrapper

  // let serviceTokens = servicePath.split('/')
  let wait = 0
  let calls = []
  let responses = {}

  let matches
  for (let node in foreignNodes) {
    matches = Path.match(servicePath, foreignNodes[node])
    if (matches.length) {
      for (let match of matches) {
        calls.push({ match: match, node: node })
      }
      logger.verbose(`${wrapper('bold', 'SEND TO ALL')} :: determined node for service ${servicePath} by first find strategy ${calls.map((o) => o.node + ':' + o.match)},   `)
    }
  }

  for (let call of calls) {
    if (responseCallback) {
      transport.send({
        route: route,
        node: call.node,
        redirect: redirect,
        payload: {
          userPayload: userPayload,
          service: call.match}},
      function (_call, err, body, response) {
        responses[`${_call.node}:${_call.match}`] = [err, body]
        wait += 1
        if (wait === calls.length) {
          responseCallback(null, responses)
          if (done) done()
        }
      }.bind(null, call))
    } else {
      transport.send({
        route: route,
        redirect: redirect,
        node: call.node,
        payload: {
          userPayload: userPayload,
          service: call.match}})
    }
  }

  // if no node matched
  if (!calls.length) {
    logger.warn(`SEND TO ALL :: Sending a message to ${servicePath} from send to all strategy failed (Local Response)`)
    if (responseCallback) {
      responseCallback(http.STATUS_CODES[404], null, null)
      if (done) done()
    }
  }
}

module.exports = _sendToAll
