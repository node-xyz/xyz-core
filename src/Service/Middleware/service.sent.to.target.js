function _sendToTarget (_target) {
  let target = _target
  return function __sendToTarget (params, next, done, xyz) {
    // note that in per call sendStrategies next and doen might be null
    // so we need an if ()
    let userPayload = params[0].payload
    let responseCallback = params[1]
    let route = params[0].route
    let redirect = params[0].redirect
    const wrapper = xyz.Util.wrapper

    let transport = xyz.serviceRepository.transport

    let logger = xyz.logger

    logger.verbose(`${wrapper('bold', 'SEND TO TARGET')} :: redirecting message directly to ${wrapper('bold', target)}:${params[0].servicePath}`)
    transport.send({
      redirect: redirect,
      node: target,
      route: route,
      payload: {
        userPayload: userPayload,
        service: params[0].servicePath}
    }, responseCallback)
    if (done) done()
  }
}

module.exports = _sendToTarget
