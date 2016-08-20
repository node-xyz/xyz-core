const logger = require('./../../Log/Logger')
const wrapper = require('./../../Util/ansi.colors').wrapper

let ReceveBasicAuth = function (params, next, end) {
  let request = params[0]
  let response = params[1]
  let body = params[2]

  if (body.auth === '123') {
    logger.debug(`${wrapper('bold', 'AUTH')} | password vertified for ${request.url}`)
    next()
  } else {
    logger.warn(`${wrapper('bold', 'AUTH')} | password invalid for ${request.url}`)
    request.destroy()
    end()
  }
}

module.exports = ReceveBasicAuth
