/** @module service-middlewares */
var http = require('http');
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
function _sendToAll(params, next, done, xyz) {
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
    // let serviceTokens = servicePath.split('/')
    var wait = 0;
    var calls = [];
    var responses = {};
    var matches;
    for (var node in foreignNodes) {
        matches = Path.match(servicePath, foreignNodes[node]);
        if (matches.length) {
            for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
                var match = matches_1[_i];
                calls.push({ match: match, node: node });
            }
            logger.verbose(wrapper('bold', 'SEND TO ALL') + " :: determined node for service " + servicePath + " by first find strategy " + calls.map(function (o) { return o.node + ':' + o.match; }) + ",   ");
        }
    }
    for (var _a = 0, calls_1 = calls; _a < calls_1.length; _a++) {
        var call = calls_1[_a];
        if (responseCallback) {
            transport.send({
                route: route,
                node: call.node,
                redirect: redirect,
                payload: userPayload,
                service: call.match
            }, function (_call, err, body, response) {
                responses[_call.node + ":" + _call.match] = [err, body];
                wait += 1;
                if (wait === calls.length) {
                    responseCallback(null, responses);
                    if (done)
                        done();
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
        logger.warn("SEND TO ALL :: Sending a message to " + servicePath + " from send to all strategy failed (Local Response)");
        if (responseCallback) {
            responseCallback(http.STATUS_CODES[404], null, null);
            if (done)
                done();
        }
    }
}
module.exports = _sendToAll;
