/** @module service-middlewares */

import { IServDiscMwParam } from './../service.interfaces';
import XYZ from './../../xyz'

/**
 * Will resolve the service path to an array of nodes that can responde to
 * the target path given. It will then send the message to first node in the array.
 * @method _firstFind
 * @param  {Array}       params [description]
 * @param  {Function}     next   used to call the next middleware
 * @param  {Function}     done   used to end the middleware stack
 * @param  {Object}       xyz    reference to the caller's xyz instance
 */
function _firstFind (params:IServDiscMwParam, next, done, xyz: XYZ) {
  let servicePath = params.opt.servicePath
  let userPayload = params.opt.payload
  let responseCallback = params.responseCallback
  let route = params.opt.route
  let redirect = params.opt.redirect

  let foreignNodes = xyz.serviceRepository.foreignNodes
  let transport = xyz.serviceRepository.transport
  let Path = xyz.path

  let logger = xyz.logger
  let wrapper = xyz.Util.wrapper

  // not used, but good to know sth like this exists!
  // let serviceTokens = servicePath.split('/')

  let matches
  for (let node in foreignNodes) {
    matches = Path.match(servicePath, foreignNodes[node])
    if (matches.length) {
      logger.verbose(`${wrapper('bold', 'FIRST FIND')} :: determined node for service ${wrapper('bold', servicePath)} by first find strategy : ${wrapper('bold', node + ':' + matches[0])}`)
      params.targets.push({node: node, service: matches[0]})
      params.targets.push({node: node, service: matches[0]})
      break
    }
  }
  if ( next ) next()
}

module.exports = _firstFind
