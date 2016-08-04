const logger = require('./../../../Log/Logger');
let request = require('request');

let pingDispatchExport = function (params, next, end) {
  let requestConfig = params[0];
  requestConfig.body = JSON.stringify(requestConfig.body);
  request.post(requestConfig, () => {});
};

module.exports = pingDispatchExport;
