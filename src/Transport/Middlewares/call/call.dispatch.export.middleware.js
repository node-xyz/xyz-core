const logger = require('./../../../Log/Logger');
let request = require('request');

let callDispatchExport = function (params, next, end) {
  let requestConfig = params[0];
  let responseCallback = params[1];

  request.post(requestConfig, responseCallback);

  end();
};

module.exports = callDispatchExport;
