/** @module bootstrapFunctions */
Object.defineProperty(exports, "__esModule", { value: true });
var udp_receive_event_1 = require("./../Transport/Middlewares/udp.receive.event");
var udp_export_middleware_1 = require("./../Transport/Middlewares/udp.export.middleware");
/**
 * Will create a new UDP tunnel over a given route and port.
 * @method _udpTunnel
 * @param  {Object}   xyz   the automatically injected paramter referring to the current xyz instance.
 * @param  {Object}   config An object with two keys:
 * - `config.route`: the route used in both sending side and in the server.
 * - `config.port`: port of the server to create. Note that no ther server should exist in this port.
 */
function _udpTunnel(xyz, config) {
    config = config || {};
    var route = config.route || 'UDP_CALL';
    var port = config.port || xyz.id().port + 1000;
    var logger = xyz.logger;
    // server side
    xyz.registerServer('UDP', port);
    xyz.registerServerRoute(port, route);
    xyz.middlewares().transport.server(route)(port).register(0, udp_receive_event_1._udpEvent);
    // client side
    xyz.registerClientRoute(route);
    xyz.middlewares().transport.client(route).register(0, udp_export_middleware_1._udpExport);
    logger.info("UDP TUNNEL :: Udp tunnel created with route " + route + " | port " + port);
}
exports._udpTunnel = _udpTunnel;
