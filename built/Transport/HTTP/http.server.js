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
Object.defineProperty(exports, "__esModule", { value: true });
var config_global_1 = require("./../../Config/config.global");
var generic_middleware_handler_1 = require("./../../Middleware/generic.middleware.handler");
var Logger_1 = require("./../../Log/Logger");
var http = require("http");
var url = require("url");
var EventEmitter = require("events");
var Interfaces_1 = require("./../Interfaces");
var Util_1 = require("./../../Util/Util");
var http_receive_event_1 = require("./../Middlewares/http.receive.event");
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
        _this.port = port || config_global_1.CONFIG.getSelfConf().port;
        _this.xyz = xyz;
        _this.serverId = {
            type: 'HTTP',
            port: port
        };
        _this.routes = {};
        var callReceiveMiddlewareStack = new generic_middleware_handler_1.GenericMiddlewareHandler(xyz, 'call.receive.mw', 'CALL');
        callReceiveMiddlewareStack.register(-1, http_receive_event_1.default);
        // on this time only we will do it manually instead of calling registerRoute
        _this.routes['CALL'] = callReceiveMiddlewareStack;
        Logger_1.logger.info("HTTP Server @ " + _this.port + " :: new message route " + Util_1.wrapper('bold', 'CALL') + " added");
        _this.server = http.createServer()
            .listen(_this.port, function () {
            Logger_1.logger.info("HTTP Server @ " + _this.port + " :: HTTP Server listening on port : " + _this.port);
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
                        Interfaces_1.xResponse(resp);
                        // create mw param message object
                        var xMessage = new Interfaces_1.xReceivedMessage({
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
        var ret = Util_1.wrapper('green', Util_1.wrapper('bold', 'Middlewares')) + ":\n";
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
            Logger_1.logger.warn('a suspicous message was received.');
            return false;
        }
        if (body.length === 0) {
            Logger_1.logger.warn('a suspicous message was received.');
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
            Logger_1.logger.error("HTTP Server @ " + this.port + " :: route " + prefix + " is not unique.");
            return false;
        }
        else {
            gmwh = gmwh || new generic_middleware_handler_1.GenericMiddlewareHandler(this.xyz, prefix + ".receive.mw", prefix);
            this.routes[prefix] = gmwh;
            Logger_1.logger.info("HTTP Server @ " + this.port + " :: new message route " + Util_1.wrapper('bold', prefix) + " added");
            return 1;
        }
    };
    /**
     * Will stop the server.
     */
    HTTPServer.prototype.terminate = function () {
        Logger_1.logger.warn("HTTP Server @ " + this.port + " :: CLOSING");
        this.close();
    };
    return HTTPServer;
}(EventEmitter));
exports.default = HTTPServer;
