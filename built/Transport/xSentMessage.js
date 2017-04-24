var xSentMessage = (function () {
    function xSentMessage(config) {
        this.userPayload = config.userPayload;
        this.xyzPayload = config.xyzPayload;
    }
    return xSentMessage;
}());
module.exports = xSentMessage;
