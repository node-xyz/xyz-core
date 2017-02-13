const http = require('http')
const logger = require('./../../../Log/Logger')

let _httpExport = function (params, next, end, xyz) {
  let requestConfig = params[0]
  let responseCallback = params[1]

  let postData = requestConfig.json
  delete requestConfig.json
  requestConfig['Content-Length'] = Buffer.byteLength(String(postData))
  requestConfig['Content-Type'] = 'application/json'

  if (responseCallback) {
    var req = http.request(requestConfig, (res) => {
      let body = []

      res.on('data', (chunck) => {
        body.push(chunck)
      })

      res.on('end', () => {
        let err = (parseInt(res.statusCode / 100) === 2 ? null : http.STATUS_CODES[res.statusCode])
        responseCallback(err, JSON.parse(body), res)
      })
    })
  } else {
    var req = http.request(requestConfig)
  }

  req.on('error', (e) => {
    if (responseCallback) {
      responseCallback(e, null, null)
    }
    logger.error(`problem with http request beign sent to ${requestConfig} :: ${e}`)
  })

  req.write(JSON.stringify(postData))
  req.end()
  end()
}

module.exports = _httpExport
