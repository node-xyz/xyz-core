/** @module service-middlewares */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Will resolve the service path to an array of nodes that can responde to
 * the target path given. It will then send the message to first node in the array.
 * @method _firstFind
 * @param  {Array}       params [description]
 * @param  {Function}     next   used to call the next middleware
 * @param  {Function}     done   used to end the middleware stack
 * @param  {Object}       xyz    reference to the caller's xyz instance
 */
function _firstFind(params, next, done, xyz) {
    var servicePath = params.opt.servicePath;
    var userPayload = params.opt.payload;
    var responseCallback = params.responseCallback;
    var route = params.opt.route;
    var redirect = params.opt.redirect;
    var foreignNodes = xyz.serviceRepository.foreignNodes;
    var transport = xyz.serviceRepository.transport;
    var Path = xyz.path;
    var logger = xyz.logger;
    var wrapper = xyz.Util.wrapper;
    // not used, but good to know sth like this exists!
    // let serviceTokens = servicePath.split('/')
    var matches;
    for (var node in foreignNodes) {
        matches = Path.match(servicePath, foreignNodes[node]);
        if (matches.length) {
            logger.verbose(wrapper('bold', 'FIRST FIND') + " :: determined node for service " + wrapper('bold', servicePath) + " by first find strategy : " + wrapper('bold', node + ':' + matches[0]));
            params.targets.push({ node: node, service: matches[0] });
            break;
        }
    }
    if (next)
        next();
}
module.exports = _firstFind;
