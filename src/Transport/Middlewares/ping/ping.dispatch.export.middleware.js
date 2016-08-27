const http = require('http')
const logger = require('./../../../Log/Logger')

let pingDispatchExport = function (params, next, end) {
  let requestConfig = params[0]
  let pingResponseCallback = params[1]

  let postData = requestConfig.json
  delete requestConfig.json
  requestConfig['Content-Length'] = Buffer.byteLength(postData)
  requestConfig['Content-Type'] = 'application/json'

  var req = http.request(requestConfig, (res) => {
    let body = []
    res.setEncoding('utf8')

    res.on('data', (chunck) => {
      body.push(chunck)
    })

    res.on('end' , () => {
      pingResponseCallback(JSON.parse(body), res)
    })
  })

  req.on('error', (e) => {
    logger.error(`problem with PING beign sent :: ${e}`)
  })

  req.write(JSON.stringify(postData))
  req.end()
  end()
}

module.exports = pingDispatchExport
