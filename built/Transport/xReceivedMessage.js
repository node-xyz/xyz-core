/**
 * This class is the common class used for all middlewares
 */
var xReceivedMessage = (function () {
    function xReceivedMessage(config) {
        if (config === void 0) { config = {}; }
        /**
         * payload of the message
         * usually contains `xyzPayload` and `userPayload` keys
         * @type {Any}
         */
        this.message = config.message;
        /**
         * Port and type of the server
         * @type {Object}
         */
        this.serverId = config.serverId;
        /**
         * metadata. dependes on the type of the server
         * @type {Object}
         */
        this.meta = config.meta;
        /**
         * Function to use for responding to this message
         * @type {Function}
         */
        this.response = config.response;
    }
    return xReceivedMessage;
}());
module.exports = xReceivedMessage;
