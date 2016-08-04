let logger = require('./../../../Log/Logger');

let pingReceveBasicAuth = function (params, next, end) {
  let request = params[0];
  let response = params[1];
  let body = params[2];

  if (body.auth === '123') {
    logger.debug('PING :: password vertified');
    next();
  } else {
    logger.warn('PING :: password invalid');
    request.destroy();
    end();
  }
}

module.exports = pingReceveBasicAuth;
