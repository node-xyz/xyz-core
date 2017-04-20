/** @module service-middlewares */
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
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
    var servicePath = params[0].servicePath;
    var userPayload = params[0].payload;
    var responseCallback = params[1];
    var route = params[0].route;
    var redirect = params[0].redirect;
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
            transport.send({
                redirect: redirect,
                node: node,
                route: route,
                payload: userPayload,
                service: matches[0]
            }, responseCallback);
            if (done)
                done();
            return;
        }
    }
    // if no node matched
    logger.warn("Sending a message to " + servicePath + " from first find strategy failed (Local Response)");
    if (responseCallback) {
        responseCallback(http.STATUS_CODES[404], null, null);
        if (done)
            done();
        return;
    }
}
module.exports = _firstFind;
