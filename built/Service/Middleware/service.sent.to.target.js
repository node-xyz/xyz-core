Object.defineProperty(exports, "__esModule", { value: true });
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
        var wrapper = xyz.Util.wrapper;
        var servicePath = params.opt.servicePath;
        var logger = xyz.logger;
        logger.verbose(wrapper('bold', 'SEND TO TARGET') + " :: redirecting message directly to " + wrapper('bold', target) + ":" + servicePath);
        params.targets.push({ node: _target, service: params.opt.servicePath });
        if (next)
            next();
    };
}
module.exports = _sendToTarget;
