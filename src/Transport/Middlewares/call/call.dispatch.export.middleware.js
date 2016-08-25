const logger = require('./../../../Log/Logger')
let request = require('request')

let callDispatchExport = function (params, next, end) {
  let requestConfig = params[0]
  let responseCallback = params[1]

  // I Still don't like this at all.
  // The root problem is that request module does not accept null callback.
  // If we switch to node http this might be solved. 
  if (responseCallback instanceof Function) {
    request.post(requestConfig, (err, response, body) => {
      responseCallback(err, response, body)
    })
  } else {
    request.post(requestConfig);
  }
  end()
}

module.exports = callDispatchExport
