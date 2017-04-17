const dgram = require('dgram')
const logger = require('./../../../Log/Logger')
let client = dgram.createSocket('udp4')

let _udpExport = function (xMessageParam, next, end, xyz) {
  let requestConfig = xMessageParam.requestConfig
  let responseCallback = xMessageParam.responseCallback

  // route must be added to the message
  requestConfig.json.xyzPayload.route = requestConfig.path

  let buff = new Buffer(JSON.stringify(requestConfig.json))
  client.send(buff, 0, buff.length, Number(requestConfig.port), requestConfig.hostname, (err, bytes) => {
    if (err) responseCallback(err, null)
    else {
      logger.silly(`exporting message using _udpExport to ${requestConfig.hostname}:${Number(requestConfig.port)}`)
      if (responseCallback) {
        responseCallback(null, `${bytes} bytes sent`)
      }
    }
  })

  end()
}

module.exports = _udpExport
