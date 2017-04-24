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
var Transport = require('./../Transport/Transport');
var CONSTANTS = require('../Config/Constants');
var GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler');
var CONFIG = require('./../Config/config.global');
var logger = require('./../Log/Logger');
var Util = require('./../Util/Util');
var PathTree = require('./path.tree');
var Path = require('./path');
var wrapper = require('./../Util/Util').wrapper;
var BOLD = require('./../Util/Util').bold;
var EventEmitter = require('events');
/**
 *
 *
 *  This module handles service dependant tasks such as managing list of other services
 *  and their functions, keeping track of other nodes, performing ping etc.
 *
 *  Note that any code and function regarding the calls
 *  should be inside undelying transportClient and
 *  transportServer
 */
var ServiceRepository = (function (_super) {
    __extends(ServiceRepository, _super);
    /**
     * Creates a new ServiceRepository
     * Transport client and server will be composed by ServiceRepository
     *
     * @param {Object} xyz the current xyz instance
     */
    function ServiceRepository(xyz) {
        var _this = _super.call(this) || this;
        /**
         * Transport layer.
         *
         * note that a ref. to xyz will be passed all the way down. this is to ensure that
         * every middleware will have access to it and
         * there will be no circular dependency
         * @type {Transport}
         */
        _this.transport = new Transport(xyz);
        /**
         * Reference to seld conf for easier usage
         * @type {Object}
         */
        _this.selfConf = CONFIG.getSelfConf();
        for (var _i = 0, _a = _this.selfConf.transport; _i < _a.length; _i++) {
            var t = _a[_i];
            _this.registerServer(t.type, t.port, !(t.event === false));
        }
        _this.callDispatchMiddlewareStack = new GenericMiddlewareHandler(xyz, 'service.discovery.mw');
        // note that this can be either string or `require`
        var sendStategy = Util._require(CONFIG.getSelfConf().defaultSendStrategy);
        if (sendStategy) {
            _this.callDispatchMiddlewareStack.register(0, sendStategy);
        }
        else {
            logger.error("SR :: defaultSendStrategy passed to config [" + CONFIG.getSelfConf().defaultSendStrategy + "] not found. setting the default value");
            _this.callDispatchMiddlewareStack.register(0, require('./Middleware/service.first.find'));
        }
        logger.info("SR :: default sendStategy set to " + _this.callDispatchMiddlewareStack.middlewares[0].name);
        /**
         * List of my this node's  services
         * @type {PathTree}
         */
        _this.services = new PathTree();
        /**
         * list of foreign nodes. should be filled by ping and should be used by
         * send strategy
         * @type {Object}
         */
        _this.foreignNodes = {};
        _this.foreignNodes[xyz.id().host + ":" + xyz.id().port] = {};
        /**
         * list of foreign routes and servers. should be filled by ping and should be used by by Transport.send() when `redirect: true`
         * @type {Object}
         */
        _this.foreignRoutes = {};
        /**
         * Reference to the curretn xyz object
         * @type {XYZ}
         */
        _this.xyz = xyz;
        return _this;
    }
    /**
     * Register a new service at a given path.
     *
     * The first parameter `path` will indicate the path of the service. Note that this path must be valid.
     *
     * `xyz.register()` will invoke this method
     *
     * @param {String} path  path of the service
     * @param {Function} fn function to be registered
     */
    ServiceRepository.prototype.register = function (path, fn) {
        if (!Path.validate(path)) {
            logger.error("SR :: Creating a new path failed. Invalid Path : " + path);
            return false;
        }
        var status = this.services.createPathSubtree(Path.format(path), fn);
        if (status) {
            logger.info("SR :: new service with path " + BOLD(path) + " added.");
            return status;
        }
    };
    /**
     * override the default `console.log` function
     */
    ServiceRepository.prototype.inspect = function () {
        var str = "\n" + wrapper('green', wrapper('bold', 'Middlewares')) + ":\n  " + this.callDispatchMiddlewareStack.inspect() + "\n" + wrapper('green', wrapper('bold', 'Services')) + ":\n";
        for (var _i = 0, _a = this.services.plainTree; _i < _a.length; _i++) {
            var s = _a[_i];
            str += "  " + s.name + " @ " + s.path + "\n";
        }
        return str;
    };
    /**
     * same as `inspect()` in JSON format
     */
    ServiceRepository.prototype.inspectJSON = function () {
        return {
            services: this.services.plainTree,
            foreignServices: this.foreignNodes,
            middlewares: [this.callDispatchMiddlewareStack.inspectJSON()]
        };
    };
    /**
     * bind default events for a given server. Should not be called directly.
     * The use can use this y setting the third parameter to `registerServer`, `e`
     * to `true`. This will case this method to be called.
     *
     * this method will cause services to be searched an invoked via `CONSTANTS.events.MESSAGE`
     *  event, which is equal to `message`. This event will be emitter by default from
     *  `http.receive.event.js` middleware.
     *
     * Note that the CONSTANTS.events.MESSAGE can only be processed if it receives the
     * entire xMessage object as parameter
     */
    ServiceRepository.prototype.bindTransportEvent = function (server) {
        var _this = this;
        server.on(CONSTANTS.events.MESSAGE, function (xMessage) {
            _this.emit('message:receive', xMessage.message);
            logger.verbose("SR :: ServiceRepository received message  " + wrapper('bold', JSON.stringify(xMessage.message)));
            var service = xMessage.message.xyzPayload.service;
            var response = xMessage.response;
            var fn = _this.services.getPathFunction(service);
            // EXPERIMENTAL
            // let fns = this.services.getPathFunctions(service)
            if (fn) {
                fn(xMessage.message.userPayload, response, xMessage.message.xyzPayload);
                return;
            }
            else {
                // this will be rarely reached . most of the time callDisplatchfind middleware will find this.
                // Same problem as explained in TEST/Transport.middleware => early response
                response.writeHead(404, {});
                response.end(JSON.stringify(http.STATUS_CODES[404]));
            }
        });
    };
    /**
     * Call a service. A middleware will be called with aproppiate arguments to find the receiving service etc.
     * @param {Object} opt the options passed to `xyz.call()`
     * @param {Function} [responseCallback] optional responseCallback
     */
    ServiceRepository.prototype.call = function (opt, responseCallback) {
        var nullFn = function () { };
        opt.payload == undefined ? null : opt.payload;
        opt.servicePath = Path.format(opt.servicePath);
        if (!Path.validate(opt.servicePath)) {
            logger.error("SR :: Aborting message " + BOLD(opt) + ". Invalid servicePath");
            if (responseCallback) {
                responseCallback("SR :: Aborting message. Invalid servicePath", null);
            }
            return false;
        }
        opt.route = opt.route || 'CALL';
        opt.redirect = opt.redirect || false;
        this.emit('message:send', { opt: opt });
        if (opt.sendStrategy) {
            // this is trying to imitate the middleware signature
            opt.sendStrategy([opt, responseCallback], nullFn, nullFn, this.xyz);
        }
        else {
            this.callDispatchMiddlewareStack.apply([opt, responseCallback], 0);
        }
        return true;
    };
    // it is VERY important to use this method when adding new servers at
    // runtime. This is because from here, we can add bindings to receive
    // messages in this server
    /**
     * create a new server. accpets the same parameters as the method with the same name in  XYZ calss.
     */
    ServiceRepository.prototype.registerServer = function (type, port, e) {
        var s = this.transport.registerServer(type, port, e);
        if (s) {
            logger.info("SR :: new transport server [" + type + "] created on port " + port);
            if (e) {
                logger.info("SR :: ServiceRepository events bounded for [" + type + "] server port " + port);
                this.bindTransportEvent(s);
            }
        }
    };
    /**
     * should be called by the ping mechanism to inform xyz of a node joining. This will update all related varibales.
     * @param aNode {String} joinin node's IP:PORT in `xyz.id().netId` format
     */
    ServiceRepository.prototype.joinNode = function (aNode) {
        this.foreignNodes[aNode] = {};
        this.foreignRoutes[aNode] = {};
        CONFIG.joinNode(aNode);
        this.logSystemUpdates();
    };
    /**
     * should be called by the ping mechanism to inform xyz of a node leaving. This will update all related varibales.
     * @param aNode {String} leaving node's IP:PORT in `xyz.id().netId` format
     */
    ServiceRepository.prototype.kickNode = function (aNode) {
        // we will not assume that this node has any function anymore
        delete this.foreignNodes[aNode];
        delete this.foreignRoutes[aNode];
        CONFIG.kickNode(aNode);
        this.logSystemUpdates();
    };
    /**
     * Will cause both the ServiceRepository and CONFIG to forget
     * about all foreign info. This includes `foreignNodes`, `foreignRoutes` and
     * `systemConf.nodes[]` to be flushed.
     * Note that this method should be called, not the one in CONFIG
     * @return {null}
     */
    ServiceRepository.prototype.forget = function () {
        for (var node in this.foreignNodes) {
            if (node !== "" + this.xyz.id().netId) {
                delete this.foreignNodes[node];
            }
        }
        this.foreignRoutes = {};
        CONFIG.forget();
        logger.warn("SR :: all foreign nodes have been removed by calling .forget()");
    };
    /**
     * Should be called after any chnage to the configurations of the system
     */
    ServiceRepository.prototype.logSystemUpdates = function () {
        logger.info("SR :: " + wrapper('bold', 'System Configuration changed') + " new values: " + JSON.stringify(CONFIG.getSystemConf()));
    };
    /**
     * will stop all servers of the system. should be used in test only.
     */
    ServiceRepository.prototype.terminate = function () {
        for (var s in this.transport.servers) {
            logger.warn("SR :: sutting down server " + s);
            this.transport.servers[s].close();
        }
    };
    return ServiceRepository;
}(EventEmitter));
module.exports = ServiceRepository;
