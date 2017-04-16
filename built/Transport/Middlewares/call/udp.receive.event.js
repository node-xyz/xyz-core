var logger = require('./../../../Log/Logger');
var CONSTANTS = require('./../../../Config/Constants');
function _udpEvent(xMessage, next, end, xyz) {
    var message = xMessage.message;
    var port = xMessage.serverId.port;
    var _transport = xyz.serviceRepository.transport.servers[port];
    logger.debug("UDP receive emitter :: Passing message from " + xMessage.message.xyzPayload.senderId + " up to service repo with " + JSON.stringify(xMessage.message.userPayload));
    _transport.emit(CONSTANTS.events.MESSAGE, xMessage);
    next();
}
module.exports = _udpEvent;
