var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var dgram = require('dgram');
var EventEmitter = require('events');
var logger = require('./../../Log/Logger');
var GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler');
var _CONFIGURATION = require('./../../Config/config.global');
var wrapper = require('./../../Util/Util').wrapper;
var xReceivedMessage = require('./../xReceivedMessage');
var UDPServer = (function (_super) {
    __extends(UDPServer, _super);
    function UDPServer(xyz, port) {
        var _this = _super.call(this) || this;
        _this.port = port;
        _this.xyz = xyz;
        /**
         * Each server should have this attribute and pass it to the constructor of
         * xMiddlewareParam object
         */
        _this.serverId = {
            type: 'UDP',
            port: port
        };
        _this.server = dgram.createSocket('udp4');
        _this.routes = {};
        _this.server.on('listening', function () {
            var address = _this.server.address();
            logger.info("UDP Server listening on port " + address.address + ":" + address.port);
        })
            .on('message', function (message, remote) {
            var _message = JSON.parse(message.toString());
            for (var route in _this.routes) {
                if (_message.xyzPayload.route === "/" + route) {
                    logger.debug("UDP SERVER @ " + _this.port + " :: udp message received for /" + wrapper('bold', route) + " [" + JSON.stringify(_message) + "]");
                    var xMessage = new xReceivedMessage({
                        message: _message,
                        response: undefined,
                        serverId: _this.serverId,
                        meta: remote
                    });
                    _this.routes[route].apply(xMessage, 0);
                    break;
                }
            }
        })
            .bind(port, _CONFIGURATION.getSelfConf().host);
        return _this;
    }
    UDPServer.prototype.inspect = function () {
        var ret = wrapper('green', wrapper('bold', 'Middlewares')) + ":\n";
        for (var route in this.routes) {
            ret += "    " + this.routes[route].inspect() + "\n";
        }
        return ret;
    };
    UDPServer.prototype.inspectJSON = function () {
        var ret = [];
        for (var route in this.routes)
            ret.push(this.routes[route].inspectJSON());
        return ret;
    };
    /**
     * Will close the server. duplicate of `.terminate()`
     */
    UDPServer.prototype.close = function () {
        this.server.close();
    };
    /**
     * Will close the server
     */
    UDPServer.prototype.terminate = function () {
        logger.warn("UDP SERVER @ " + this.port + " :: CLOSING");
        this.close();
    };
    // will initialize a new route with one default middleware
    // NOTE: this is experimental and there is no support to send sth directly to this
    // from whithin xyz. this is designed mostly for users outside of the system to have
    // a communication way
    UDPServer.prototype.registerRoute = function (prefix, gmwh) {
        var globalUnique = this.xyz.serviceRepository.transport._checkUniqueRoute(prefix);
        if (!globalUnique) {
            logger.error("UDP Server @ " + this.port + " :: route " + prefix + " is not unique.");
            return false;
        }
        else {
            gmwh = gmwh || new GenericMiddlewareHandler(this.xyz, prefix + ".receive.mw", prefix);
            this.routes[prefix] = gmwh;
            logger.info("UDP Server @ " + this.port + " :: new message route " + wrapper('bold', prefix) + " added");
            return 1;
        }
    };
    return UDPServer;
}(EventEmitter));
module.exports = UDPServer;
