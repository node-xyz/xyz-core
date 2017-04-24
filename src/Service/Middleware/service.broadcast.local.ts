import { IServDiscMwParam } from './../service.interfaces';
/** @module service-middlewares */

import * as http from 'http'

/**
 * will ignore the service path enitrely and will send the message to every
 * known host in localhost. Note that this module does not resolve path addresses
 * @function _braodcastLocal
 * @param  {Array}       params [description]
 * @param  {Function}     next   used to call the next middleware
 * @param  {Function}     done   used to end the middleware stack
 * @param  {Object}       xyz    reference to the caller's xyz instance
 */
function _broadcastLocal (params:IServDiscMwParam, next, done, xyz) {
  let servicePath = params.opt.servicePath

  let foreignNodes = xyz.serviceRepository.foreignNodes
  let logger = xyz.logger
  const wrapper = xyz.Util.wrapper

  let calls = []
  let responses = {}

  let matches
  const HOST = xyz.id().host
  for (let node in foreignNodes) {
    if (node.split(':')[0] === HOST) {
      params.targets.push({ service: servicePath, node: node })
    }
  }
  if (next) (next())
  logger.verbose(`${wrapper('bold', 'BROADCAST LOCAL')} :: sending message to ${calls.map((o) => o.node + ':' + o.match)},  `)

}

module.exports = _broadcastLocal
