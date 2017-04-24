import { IServDiscMwParam } from './../service.interfaces';
/** @module service-middlewares */

/**
 * Will send a message to exactly one node .
 * @method _sendToTarget
 * @param  {String}      _target target node netId
 * @example `ms.call({... , sendStrategy: sendToTaget('192.168.0.0:5000')}, () => {})`
 */
function _sendToTarget (_target) {
  let target = _target
  return function __sendToTarget (params:IServDiscMwParam, next, done, xyz) {
    // note that in per call sendStrategies next and doen might be null
    // so we need an if ()
    const wrapper = xyz.Util.wrapper
    let servicePath = params.opt.servicePath
    let logger = xyz.logger

    logger.verbose(`${wrapper('bold', 'SEND TO TARGET')} :: redirecting message directly to ${wrapper('bold', target)}:${servicePath}`)
    params.targets.push({node: _target, service: params.opt.servicePath})
    if (next) next()
  }
}

module.exports = _sendToTarget
