
/**
 * This class is the common class used for all middlewares
 */
class xReceivedMessage {
  constructor (config = {}) {
    /**
     * payload of the message
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

module.exports = xReceivedMessage
