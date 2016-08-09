const logger = require('./../../Log/Logger');

let dispatchBasicAuth = function (params, next, end) {
  let requestConfig = params[0];
  requestConfig.json.auth = "123";
  next();
};

module.exports = dispatchBasicAuth;
