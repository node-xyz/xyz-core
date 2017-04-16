var xSentMessageMwParam = (function () {
    function xSentMessageMwParam(config) {
        this.requestConfig = config.requestConfig;
        this.responseCallback = config.responseCallback;
    }
    return xSentMessageMwParam;
}());
module.exports = xSentMessageMwParam;
