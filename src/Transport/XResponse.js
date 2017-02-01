module.exports =
  class XResponse {
    constructor (response) {
      this.response = response
    }

    send (payload, statusCode = 200) {
      this.response.writeHead(statusCode, {'Content-Type': 'Application/json'})
      this.response.end(JSON.stringify({userPayload: payload}))
    }
}
