/** @module service-middlewares */
/**
 * Will send a message to exactly one node .
 * @method _sendToTarget
 * @param  {String}      _target target node netId
 * @example `ms.call({... , sendStrategy: sendToTaget('192.168.0.0:5000')}, () => {})`
 */
function _sendToTarget(_target) {
    var target = _target;
    return function __sendToTarget(params, next, done, xyz) {
        // note that in per call sendStrategies next and doen might be null
        // so we need an if ()
        var userPayload = params[0].payload;
        var responseCallback = params[1];
        var route = params[0].route;
        var redirect = params[0].redirect;
        var wrapper = xyz.Util.wrapper;
        var transport = xyz.serviceRepository.transport;
        var logger = xyz.logger;
        logger.verbose(wrapper('bold', 'SEND TO TARGET') + " :: redirecting message directly to " + wrapper('bold', target) + ":" + params[0].servicePath);
        transport.send({
            redirect: redirect,
            node: target,
            route: route,
            payload: userPayload,
            service: params[0].servicePath
        }, responseCallback);
        if (done)
            done();
    };
}
module.exports = _sendToTarget;
