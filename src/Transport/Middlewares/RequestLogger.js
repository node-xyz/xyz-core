const logger = require('./../../Log/Logger');

function requestLogger(params, next) {
  let request = params[0];
  let response = params[1];
  let body = params[2];
  let _transport = params[3];

  logger.silly(`Request Hit at ${request.url}`);
  next();
}

module.exports = requestLogger;