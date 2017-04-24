import { IServDiscMwParam } from './../service.interfaces';
/** @module service-middlewares */
import * as http from 'http'

/**
 * will broadcast a message regardless of the path to all nodes.
 * @method _braodcastGlobal
 * @param  {Array}       params [description]
 * @param  {Function}     next   used to call the next middleware
 * @param  {Function}     done   used to end the middleware stack
 * @param  {Object}       xyz    reference to the caller's xyz instance
 */
function _broadcastGlobal (params:IServDiscMwParam, next, done, xyz) {
  let servicePath = params.opt.servicePath

  let foreignNodes = xyz.serviceRepository.foreignNodes
  let logger = xyz.logger
  const wrapper = xyz.Util.wrapper

  let wait = 0
  let calls = []
  let responses = {}

  for (let node in foreignNodes) {
    params.targets.push({ service: servicePath, node: node })
  }

  logger.verbose(`${wrapper('bold', 'BROADCAST GLOBAL')} :: sending message to ${calls.map((o) => o.node + ':' + o.match)},  `)
  if ( next ) ( next())
}

module.exports = _broadcastGlobal
