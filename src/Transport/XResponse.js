module.exports =
  class XResponse {
    constructor (response) {
      this.response = response
    }

    send (payload) {
      this.response.end(JSON.stringify({userPayload: payload}))
    }
}
