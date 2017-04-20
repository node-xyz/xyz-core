export class xSentMessageMwParam {
  constructor (config) {
    this.requestConfig = config.requestConfig
    this.responseCallback = config.responseCallback
  }
}

export class xSentMessage {
  constructor (config) {
    this.userPayload = config.userPayload
    this.xyzPayload = config.xyzPayload
  }
}

export function xResponse(resposenObject) {
  resposenObject['jsonify'] = (data, ...args) => {
    resposenObject.end(JSON.stringify(data), ...args)
  }
}


/**
 * This class is the common class used for all middlewares
 */
export class xReceivedMessage {
  constructor (config = {}) {
    /**
     * payload of the message
     * usually contains `xyzPayload` and `userPayload` keys
     * @type {Any}
     */
    this.message = config.message

    /**
     * Port and type of the server
     * @type {Object}
     */
    this.serverId = config.serverId

    /**
     * metadata. dependes on the type of the server
     * @type {Object}
     */
    this.meta = config.meta

    /**
     * Function to use for responding to this message
     * @type {Function}
     */
    this.response = config.response
  }
}

