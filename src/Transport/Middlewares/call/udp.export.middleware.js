const dgram = require('dgram')
const logger = require('./../../../Log/Logger')
let client = dgram.createSocket('udp4')

let _udpExport = function (params, next, end, xyz) {
  let requestConfig = params[0]
  let responseCallback = params[1]
  let buff = new Buffer(JSON.stringify({json: requestConfig.json, path: requestConfig.path}))
  client.send(buff, 0, buff.length, Number(requestConfig.port), requestConfig.hostname, (err, bytes) => {
    if (err) responseCallback(err, null)
    else {
      logger.debug(`exported message using _udpExport to ${requestConfig.hostname}:${Number(requestConfig.port)}`)
      if (responseCallback) {
        responseCallback(null, `${bytes} bytes sent`)
      }
    }
  })

  end()
}

module.exports = _udpExport
