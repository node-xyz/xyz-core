let fs = require('fs');
let ursa = require('ursa');
let _CONFIGURATIONS = require('./../../Config/config.global');
let logger = require('./../../Log/Logger');

function rsaAuth(params, next) {
  let request = params[0];
  let response = params[1];
  let body = params[2];
  let _transport = params[3];

  logger.debug(`Bipassing ras middle ware`);
  next();
}

module.exports = rsaAuth;
