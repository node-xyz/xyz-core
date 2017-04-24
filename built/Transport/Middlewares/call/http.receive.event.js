var logger = require('./../../../Log/Logger');
var CONSTANTS = require('./../../../Config/Constants');
function _httpMessageEvent(xMessage, next, end, xyz) {
    var request = xMessage.meta.request;
    var message = xMessage.message;
    var port = xMessage.serverId.port;
    var _transport = xyz.serviceRepository.transport.servers[port];
    logger.debug("HTTP Receive emitter :: Passing request to " + request.url + " up to service repo with " + JSON.stringify(message));
    _transport.emit(CONSTANTS.events.MESSAGE, xMessage);
    next();
}
module.exports = _httpMessageEvent;
