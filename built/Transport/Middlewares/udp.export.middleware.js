Object.defineProperty(exports, '__esModule', { value: true })
var dgram = require('dgram')
var Logger_1 = require('./../../Log/Logger')
var client = dgram.createSocket('udp4')
function _udpExport (xMessageParam, next, end, xyz) {
  var requestConfig = xMessageParam.requestConfig
  var responseCallback = xMessageParam.responseCallback
    // route must be added to the message
  requestConfig.json.xyzPayload.route = requestConfig.path
  var buff = new Buffer(JSON.stringify(requestConfig.json))
  client.send(buff, 0, buff.length, Number(requestConfig.port), requestConfig.hostname, function (err, bytes) {
    if (err)
      responseCallback(err, null)
    else {
      Logger_1.logger.silly('exporting message using _udpExport to ' + requestConfig.hostname + ':' + Number(requestConfig.port))
      if (responseCallback) {
        responseCallback(null, bytes + ' bytes sent')
      }
    }
  })
  end()
}
exports._udpExport = _udpExport
