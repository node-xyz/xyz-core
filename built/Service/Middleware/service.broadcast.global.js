Object.defineProperty(exports, '__esModule', { value: true })
/**
 * will broadcast a message regardless of the path to all nodes.
 * @method _braodcastGlobal
 * @param  {Array}       params [description]
 * @param  {Function}     next   used to call the next middleware
 * @param  {Function}     done   used to end the middleware stack
 * @param  {Object}       xyz    reference to the caller's xyz instance
 */
function _broadcastGlobal (params, next, done, xyz) {
  var servicePath = params.opt.servicePath
  var foreignNodes = xyz.serviceRepository.foreignNodes
  var logger = xyz.logger
  var wrapper = xyz.Util.wrapper
  var wait = 0
  var calls = []
  var responses = {}
  for (var node in foreignNodes) {
    params.targets.push({ service: servicePath, node: node })
  }
  logger.verbose(wrapper('bold', 'BROADCAST GLOBAL') + ' :: sending message to ' + calls.map(function (o) { return o.node + ':' + o.match }) + ',  ')
  if (next)
    (next())
}
module.exports = _broadcastGlobal
