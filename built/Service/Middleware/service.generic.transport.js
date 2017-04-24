Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
function _genericTransportInvoke(params, next, end, xyz) {
    var targets = params.targets;
    var transport = xyz.serviceRepository.transport;
    var responseCallback = params.responseCallback;
    var logger = xyz.logger;
    logger.verbose("SR :: Generic service discovery message emitter. invoking Transport layer with " + params.targets.map(function (o) { return o.node + o.service; }).join(', ') + " | service: " + params.opt.servicePath + ".");
    if (targets.length === 0) {
        logger.warn("Sending a message to " + params.opt.servicePath + " from first find strategy failed (Local Response)");
        responseCallback(http.STATUS_CODES[404], null, null);
    }
    else if (targets.length === 1) {
        var config = {
            redirect: params.opt.redirect,
            route: params.opt.route,
            node: params.targets[0].node,
            payload: params.opt.payload,
            service: params.targets[0].service
        };
        transport.send(config, responseCallback);
        end();
    }
    else if (targets.length > 1) {
        var wait_1 = 0;
        var responses_1 = {};
        var _loop_1 = function (target) {
            var config = {
                redirect: params.opt.redirect,
                route: params.opt.route,
                node: target.node,
                payload: params.opt.payload,
                service: target.service
            };
            if (responseCallback) {
                transport.send(config, function (_target, err, body, response) {
                    responses_1[target.node + ":" + target.service] = [err, body];
                    wait_1 += 1;
                    if (wait_1 === targets.length) {
                        responseCallback(null, responses_1, null);
                        if (end)
                            end();
                    }
                }.bind(null, target));
            }
            else {
                transport.send(config);
            }
        };
        for (var _i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
            var target = targets_1[_i];
            _loop_1(target);
        }
    }
}
exports._genericTransportInvoke = _genericTransportInvoke;
