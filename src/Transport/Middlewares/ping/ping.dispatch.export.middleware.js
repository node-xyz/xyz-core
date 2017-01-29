const http = require('http')
const logger = require('./../../../Log/Logger')

let pingDispatchExport = function (params, next, end) {
  let requestConfig = params[0]
  let pingResponseCallback = params[1]

  let postData = requestConfig.json
  delete requestConfig.json
  requestConfig['Content-Length'] = Buffer.byteLength(String(postData))
  requestConfig['Content-Type'] = 'application/json'

  var req = http.request(requestConfig, (res) => {
    let body = []
    res.setEncoding('utf8')

    res.on('data', (chunck) => {
      body.push(chunck)
    })

    res.on('end', () => {
      pingResponseCallback(null, JSON.parse(body), res)
    })
  })

  req.on('error', (e) => {
    pingResponseCallback(e, null, null)
  })

  req.write(JSON.stringify(postData))
  req.end()
  end()
}

module.exports = pingDispatchExport
