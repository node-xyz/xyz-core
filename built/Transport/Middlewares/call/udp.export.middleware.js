var dgram = require('dgram');
var logger = require('./../../../Log/Logger');
var client = dgram.createSocket('udp4');
var _udpExport = function (xMessageParam, next, end, xyz) {
    var requestConfig = xMessageParam.requestConfig;
    var responseCallback = xMessageParam.responseCallback;
    // route must be added to the message
    requestConfig.json.xyzPayload.route = requestConfig.path;
    var buff = new Buffer(JSON.stringify(requestConfig.json));
    client.send(buff, 0, buff.length, Number(requestConfig.port), requestConfig.hostname, function (err, bytes) {
        if (err)
            responseCallback(err, null);
        else {
            logger.silly("exporting message using _udpExport to " + requestConfig.hostname + ":" + Number(requestConfig.port));
            if (responseCallback) {
                responseCallback(null, bytes + " bytes sent");
            }
        }
    });
    end();
};
module.exports = _udpExport;
