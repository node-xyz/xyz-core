/** @module service-middlewares */
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
/**
 * will ignore the service path enitrely and will send the message to every
 * known host in localhost. Note that this module does not resolve path addresses
 * @function _braodcastLocal
 * @param  {Array}       params [description]
 * @param  {Function}     next   used to call the next middleware
 * @param  {Function}     done   used to end the middleware stack
 * @param  {Object}       xyz    reference to the caller's xyz instance
 */
function _broadcastLocal(params, next, done, xyz) {
    var servicePath = params[0].servicePath;
    var userPayload = params[0].payload;
    var responseCallback = params[1];
    var route = params[0].route;
    var redirect = params[0].redirect;
    var foreignNodes = xyz.serviceRepository.foreignNodes;
    var transport = xyz.serviceRepository.transport;
    var logger = xyz.logger;
    var Path = xyz.path;
    var wrapper = xyz.Util.wrapper;
    var wait = 0;
    var calls = [];
    var responses = {};
    var matches;
    var HOST = xyz.id().host;
    for (var node in foreignNodes) {
        if (node.split(':')[0] === HOST) {
            calls.push({ match: servicePath, node: node });
        }
    }
    logger.verbose(wrapper('bold', 'BROADCAST LOCAL') + " :: sending message to " + calls.map(function (o) { return o.node + ':' + o.match; }) + ",  ");
    for (var _i = 0, calls_1 = calls; _i < calls_1.length; _i++) {
        var call = calls_1[_i];
        if (responseCallback) {
            transport.send({
                route: route,
                redirect: redirect,
                node: call.node,
                payload: userPayload,
                service: call.match
            }, function (_call, err, body, response) {
                responses[_call.node + ":" + _call.match] = [err, body];
                wait += 1;
                if (wait === calls.length) {
                    responseCallback(null, responses);
                }
            }.bind(null, call));
        }
        else {
            transport.send({
                route: route,
                redirect: redirect,
                node: call.node,
                payload: userPayload,
                service: call.match
            });
        }
    }
    // if no node matched
    if (!calls.length) {
        logger.warn("BROADCAST LOCAL :: Sending a message to " + servicePath + " from failed (Local Response)");
        if (responseCallback) {
            responseCallback(http.STATUS_CODES[404], null, null);
        }
    }
}
module.exports = _broadcastLocal;
