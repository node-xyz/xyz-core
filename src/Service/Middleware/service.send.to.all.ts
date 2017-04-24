import { logger } from './../../Log/Logger';
/** @module service-middlewares */
import { IServDiscMwParam } from './../service.interfaces';
import XYZ from './../../xyz'
import * as http from 'http'

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
function _sendToAll (params: IServDiscMwParam, next, done, xyz:XYZ) {
  let servicePath = params.opt.servicePath
  let userPayload = params.opt.payload
  let responseCallback = params.responseCallback
  let route = params.opt.route
  let redirect = params.opt.redirect

  let foreignNodes = xyz.serviceRepository.foreignNodes
  let logger = xyz.logger
  let Path = xyz.path
  let wrapper = xyz.Util.wrapper

  // let serviceTokens = servicePath.split('/')

  let matches
  for (let node in foreignNodes) {
    matches = Path.match(servicePath, foreignNodes[node])
    if (matches.length) {
      for (let match of matches) {        
        params.targets.push({ service: match, node: node })
      }
    }
  }

  logger.verbose(`${wrapper('bold', 'SEND TO ALL')} :: determined node for service ${servicePath} by first find strategy ${params.targets.map((o) => o.node + ':' + o.service)},   `)
  if (next) next()

}

module.exports = _sendToAll
