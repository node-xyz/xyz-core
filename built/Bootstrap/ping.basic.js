Object.defineProperty(exports, "__esModule", { value: true });
var generic_middleware_handler_1 = require("./../Middleware/generic.middleware.handler");
var http_export_middleware_1 = require("./../Transport/Middlewares/http.export.middleware");
var interval = 2000;
var threshold = 2000;
var kick = 10;
/** @module bootstrapFunctions */
/**
 * Will setup a basic ping mechanism for the node. This will automatically bootstrap unless `selfConf.defaultBootstrap` is set to `false`
 * @method _basicPingBootstrap
 * @param  {Object}            xyz   the automatically injected paramter referring to the current xyz instance.
 * @param  {Bollean}            event indicates if pingRate message listener should be creted or not.
 * @param  {Number}            port  the port to identify the route and server to use
 */
function _basicPingBootstrap(xyz, event, port) {
    var Util = xyz.Util;
    var wrapper = Util.wrapper;
    var logger = xyz.logger;
    var CONFIG = xyz.CONFIG;
    var CONSTANTS = xyz.CONSTANTS;
    var SR = xyz.serviceRepository;
    var outOfReachNodes = {};
    var transport = SR.transport;
    var joinCandidate = [];
    var seeds = CONFIG.getSelfConf().seed;
    function contactSeed(idx) {
        transport.send({ node: seeds[idx], route: 'PING' }, function (err, body, res) {
            if (!err) {
                logger.info(wrapper('bold', 'JOIN PING ACCEPTED') + ". response : " + JSON.stringify(body));
                for (var _i = 0, _a = body.nodes; _i < _a.length; _i++) {
                    var node = _a[_i];
                    SR.joinNode(node);
                }
                // no need to do this. guess why :D
                // this.joinNode(seeds[idx])
            }
            else {
                logger.error(wrapper('bold', 'JOIN PING REJECTED') + " :: seed node " + seeds[idx] + " rejected with ");
                setTimeout(function () { return contactSeed(idx === seeds.length - 1 ? 0 : ++idx); }, interval + Util.Random(threshold));
            }
        });
    }
    function _ping() {
        var nodes = CONFIG.getSystemConf().nodes;
        var _loop_1 = function (node) {
            SR.transport.send({
                route: 'PING',
                node: node
            }, function (err, body, res) {
                if (err == null) {
                    SR.foreignNodes[node] = body.services;
                    SR.foreignRoutes[node] = body.transportServers;
                    for (var _i = 0, _a = body.nodes; _i < _a.length; _i++) {
                        var tempNode = _a[_i];
                        if (nodes.indexOf(tempNode) === -1) {
                            logger.warn("PING :: new join candidate suggested by " + node + " : {" + tempNode + "}");
                            joinCandidate.push(tempNode);
                        }
                    }
                    // but we trust the callee 100% so we set it's availability to full
                    outOfReachNodes[node] = 0;
                    logger.silly("PING  :: response = " + JSON.stringify(body));
                }
                else {
                    if (outOfReachNodes[node]) {
                        if (outOfReachNodes[node] >= kick) {
                            logger.error("PING :: removing node {" + node + "} from foreignNodes and nodes list");
                            SR.kickNode(node);
                            return;
                        }
                        outOfReachNodes[node] += 1;
                    }
                    else {
                        outOfReachNodes[node] = 1;
                    }
                    logger.error("Ping Error :: " + node + " has been out of reach for " + outOfReachNodes[node] + " pings ::  " + JSON.stringify(err));
                }
            });
        };
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            _loop_1(node);
        }
        var _loop_2 = function (cNode) {
            if (cNode) {
                SR.transport.send({ node: cNode, route: 'PING' }, function (err, body, res) {
                    // this candidate has failed to prove itself
                    if (err) {
                        logger.error("join candidate " + cNode + " rejected due to " + err);
                    }
                    else {
                        // note that we do not use the body (services) here.
                        // we wait until the next ping round for double check
                        SR.joinNode(cNode);
                    }
                    joinCandidate.splice(joinCandidate.indexOf(cNode), 1);
                });
            }
        };
        for (var _a = 0, joinCandidate_1 = joinCandidate; _a < joinCandidate_1.length; _a++) {
            var cNode = joinCandidate_1[_a];
            _loop_2(cNode);
        }
    }
    function onPingReceive(sender, response) {
        logger.debug("PING :: message received from " + JSON.stringify(sender));
        if (CONFIG.getSystemConf().nodes.indexOf(sender) === -1) {
            logger.warn("PING :: new node is pinging me. adding to joinCandidate list. address : " + sender);
            joinCandidate.push(sender);
        }
        response.end(JSON.stringify({
            services: SR.services.sRoot,
            nodes: CONFIG.getSystemConf().nodes,
            transportServers: SR.transport.getServerRoutes()
        }));
    }
    function _pingEvent(xMessage, next, end, xyz) {
        var response = xMessage.response;
        var sender = xMessage.message.xyzPayload.senderId;
        var _transport = xyz.serviceRepository.transport.servers[port];
        logger.silly('PING :: Passing ping to up to onPingReceive fn.');
        _transport.emit(CONSTANTS.events.PING, sender, response);
        next();
    }
    setInterval(_ping, interval + Util.Random(threshold));
    // bind listener
    var pingReceiveMiddlewareStack = new generic_middleware_handler_1.GenericMiddlewareHandler(xyz, 'ping.receive.mw', 'PING');
    var pingDispatchMiddlewareStack = new generic_middleware_handler_1.GenericMiddlewareHandler(xyz, 'ping.dispatch.mw', 'PING');
    pingReceiveMiddlewareStack.register(0, _pingEvent);
    pingDispatchMiddlewareStack.register(0, http_export_middleware_1.default);
    SR.transport.registerRoute('PING', pingDispatchMiddlewareStack);
    SR.transport.servers[port].registerRoute('PING', pingReceiveMiddlewareStack);
    SR.transport.servers[port].on(CONSTANTS.events.PING, onPingReceive);
    logger.info("default ping bootstraped for approx. every " + interval + " ms");
    if (event) {
        logger.info('ipc channel created from default ping');
        process.on('message', function (data) {
            if (data.title === 'pingRate') {
                process.send({
                    title: data.title,
                    body: { interval: interval, maxInterval: interval, minInterval: interval }
                });
            }
        });
    }
    _ping();
    if (seeds.length) {
        contactSeed(0);
    }
}
exports.default = _basicPingBootstrap;
