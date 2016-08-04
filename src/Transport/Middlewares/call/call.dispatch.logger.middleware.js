const logger = require('./../../../Log/Logger');

let callDispatchLogger = function (params, next, end) {
  let requestConfig = params[0];
  let responseCallback = params[1];
  logger.debug(`Sendign request to ${requestConfig.uri}`);
  next();
};

module.exports = callDispatchLogger;
