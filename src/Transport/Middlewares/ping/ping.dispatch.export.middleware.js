const logger = require('./../../../Log/Logger')
let request = require('request')

let pingDispatchExport = function (params, next, end) {
  let requestConfig = params[0]
  let pingResponseCallback = params[1]
  request.post(requestConfig, pingResponseCallback)
  end()
}

module.exports = pingDispatchExport
