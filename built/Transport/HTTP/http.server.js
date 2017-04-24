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
var http = require('http');
var url = require('url');
var EventEmitter = require('events');
var XResponse = require('./../XResponse');
var logger = require('./../../Log/Logger');
var GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler');
var CONFIG = require('./../../Config/config.global');
var wrapper = require('./../../Util/Util').wrapper;
var xReceivedMessage = require('./../xReceivedMessage');
var HTTPServer = (function (_super) {
    __extends(HTTPServer, _super);
    /**
     * Creates a new HTTP server
     * @param xyz {Object} a reference to the curretn xyz object. will be filled automatically.
     * @param port {String|Number} The main port of this server.
     */
    function HTTPServer(xyz, port) {
        var _this = _super.call(this) || this;
        http.globalAgent.maxSockets = Infinity;
        _this.port = port || CONFIG.getSelfConf().port;
        _this.xyz = xyz;
        _this.serverId = {
            type: 'HTTP',
            port: port
        };
        _this.routes = {};
        var callReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'call.receive.mw', 'CALL');
        callReceiveMiddlewareStack.register(-1, require('./../Middlewares/call/http.receive.event'));
        // on this time only we will do it manually instead of calling registerRoute
        _this.routes['CALL'] = callReceiveMiddlewareStack;
        logger.info("HTTP Server @ " + _this.port + " :: new message route " + wrapper('bold', 'CALL') + " added");
        _this.server = http.createServer()
            .listen(_this.port, function () {
            logger.info("HTTP Server @ " + _this.port + " :: HTTP Server listening on port : " + _this.port);
        }).on('request', function (req, resp) {
            var body = [];
            req
                .on('data', function (chuck) {
                body.push(chuck);
            })
                .on('end', function () {
                if (!_this.validator(req, body)) {
                    req.destroy();
                    return;
                }
                var parsedUrl = url.parse(req.url);
                var dismissed = false;
                for (var route in _this.routes) {
                    if (parsedUrl.pathname === "/" + route) {
                        // wrap response
                        XResponse(resp);
                        // create mw param message object
                        var xMessage = new xReceivedMessage({
                            serverId: _this.serverId,
                            message: JSON.parse(body),
                            response: resp,
                            meta: { request: req }
                        });
                        _this.routes[route].apply(xMessage, 0);
                        dismissed = true;
                        break;
                    }
                }
                if (!dismissed) {
                    req.destroy();
                }
            });
        });
        return _this;
    }
    HTTPServer.prototype.inspect = function () {
        var ret = wrapper('green', wrapper('bold', 'Middlewares')) + ":\n";
        for (var route in this.routes) {
            ret += "    " + this.routes[route].inspect() + "\n";
        }
        return ret;
    };
    HTTPServer.prototype.inspectJSON = function () {
        var ret = [];
        for (var route in this.routes)
            ret.push(this.routes[route].inspectJSON());
        return ret;
    };
    HTTPServer.prototype.close = function () {
        this.server.close();
    };
    HTTPServer.prototype.validator = function (req, body) {
        if (req.method !== 'POST') {
            logger.warn('a suspicous message was received.');
            return false;
        }
        if (body.length === 0) {
            logger.warn('a suspicous message was received.');
            return false;
        }
        return true;
    };
    // will initialize a new route with one default middleware
    // NOTE: this is experimental and there is no support to send sth directly to this
    // from whithin xyz. this is designed mostly for users outside of the system to have
    // a communication way
    HTTPServer.prototype.registerRoute = function (prefix, gmwh) {
        var globalUnique = this.xyz.serviceRepository.transport._checkUniqueRoute(prefix);
        if (!globalUnique) {
            logger.error("HTTP Server @ " + this.port + " :: route " + prefix + " is not unique.");
            return false;
        }
        else {
            gmwh = gmwh || new GenericMiddlewareHandler(this.xyz, prefix + ".receive.mw", prefix);
            this.routes[prefix] = gmwh;
            logger.info("HTTP Server @ " + this.port + " :: new message route " + wrapper('bold', prefix) + " added");
            return 1;
        }
    };
    /**
     * Will stop the server.
     */
    HTTPServer.prototype.terminate = function () {
        logger.warn("HTTP Server @ " + this.port + " :: CLOSING");
        this.close();
    };
    return HTTPServer;
}(EventEmitter));
module.exports = HTTPServer;
