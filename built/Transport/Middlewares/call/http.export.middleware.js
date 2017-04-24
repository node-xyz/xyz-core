var http = require('http');
var logger = require('./../../../Log/Logger');
var _httpExport = function (xMessageParam, next, end, xyz) {
    var requestConfig = xMessageParam.requestConfig;
    var responseCallback = xMessageParam.responseCallback;
    var postData = requestConfig.json;
    delete requestConfig.json;
    requestConfig['Content-Length'] = Buffer.byteLength(String(postData));
    requestConfig['Content-Type'] = 'application/json';
    var req;
    if (responseCallback) {
        req = http.request(requestConfig, function (res) {
            var body = [];
            res.on('data', function (chunck) {
                body.push(chunck);
            });
            res.on('end', function () {
                var err = (parseInt(res.statusCode / 100) === 2 ? null : http.STATUS_CODES[res.statusCode]);
                responseCallback(err, JSON.parse(body), res);
            });
        });
    }
    else {
        req = http.request(requestConfig);
    }
    req.on('error', function (e) {
        if (responseCallback) {
            responseCallback(e, null, null);
        }
    });
    req.write(JSON.stringify(postData));
    req.end();
    end();
};
module.exports = _httpExport;
