Object.defineProperty(exports, "__esModule", { value: true });
var xSentMessageMwParam = (function () {
    function xSentMessageMwParam(config) {
        this.requestConfig = config.requestConfig;
        this.responseCallback = config.responseCallback;
    }
    return xSentMessageMwParam;
}());
exports.xSentMessageMwParam = xSentMessageMwParam;
var xSentMessage = (function () {
    function xSentMessage(config) {
        this.userPayload = config.userPayload;
        this.xyzPayload = config.xyzPayload;
    }
    return xSentMessage;
}());
exports.xSentMessage = xSentMessage;
function xResponse(resposenObject) {
    resposenObject['jsonify'] = function (data) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        resposenObject.end.apply(resposenObject, [JSON.stringify(data)].concat(args));
    };
}
exports.xResponse = xResponse;
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
exports.xReceivedMessage = xReceivedMessage;
