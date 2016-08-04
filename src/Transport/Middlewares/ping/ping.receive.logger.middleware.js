const logger = require('./../../../Log/Logger');

function requestLogger(params, next) {
  let request = params[0];
  let response = params[1];
  let body = params[2];
  let _transport = params[3];

  logger.debug(`PING :: Ping Hit at ${request.url} | body is ${body}`);
  next();
}

module.exports = requestLogger;
