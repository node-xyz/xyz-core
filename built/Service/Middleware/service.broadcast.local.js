Object.defineProperty(exports, '__esModule', { value: true })
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
  var servicePath = params.opt.servicePath
  var foreignNodes = xyz.serviceRepository.foreignNodes
  var logger = xyz.logger
  var wrapper = xyz.Util.wrapper
  var calls = []
  var responses = {}
  var matches
  var HOST = xyz.id().host
  for (var node in foreignNodes) {
    if (node.split(':')[0] === HOST) {
      params.targets.push({ service: servicePath, node: node })
    }
  }
  if (next)
    (next())
  logger.verbose(wrapper('bold', 'BROADCAST LOCAL') + ' :: sending message to ' + calls.map(function (o) { return o.node + ':' + o.match }) + ',  ')
}
module.exports = _broadcastLocal
