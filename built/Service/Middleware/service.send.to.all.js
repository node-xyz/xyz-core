Object.defineProperty(exports, '__esModule', { value: true })
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
  var servicePath = params.opt.servicePath
  var userPayload = params.opt.payload
  var responseCallback = params.responseCallback
  var route = params.opt.route
  var redirect = params.opt.redirect
  var foreignNodes = xyz.serviceRepository.foreignNodes
  var logger = xyz.logger
  var Path = xyz.path
  var wrapper = xyz.Util.wrapper
    // let serviceTokens = servicePath.split('/')
  var matches
  for (var node in foreignNodes) {
    matches = Path.match(servicePath, foreignNodes[node])
    if (matches.length) {
      for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i]
        params.targets.push({ service: match, node: node })
      }
    }
  }
  logger.verbose(wrapper('bold', 'SEND TO ALL') + ' :: determined node for service ' + servicePath + ' by first find strategy ' + params.targets.map(function (o) { return o.node + ':' + o.service }) + ',   ')
  if (next)
    next()
}
module.exports = _sendToAll
