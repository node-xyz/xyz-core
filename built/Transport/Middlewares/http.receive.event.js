Object.defineProperty(exports, "__esModule", { value: true });
var Constants_1 = require("./../../Config/Constants");
function _httpMessageEvent(xMessage, next, end, xyz) {
    var request = xMessage.meta.request;
    var message = xMessage.message;
    var port = xMessage.serverId.port;
    var _transport = xyz.serviceRepository.transport.servers[port];
    // logger.debug(`HTTP Receive emitter :: Passing request to ${request.url} up to service repo with ${JSON.stringify(message)}`)
    _transport.emit(Constants_1.CONSTANTS.events.MESSAGE, xMessage);
    next();
}
exports.default = _httpMessageEvent;
