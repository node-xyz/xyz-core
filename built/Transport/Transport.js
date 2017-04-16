var logger = require('./../Log/Logger');
var CONFIG = require('./../Config/config.global');
var GenericMiddlewareHandler = require('./../Middleware/generic.middleware.handler');
var wrapper = require('./../Util/Util').wrapper;
var HTTPServer = require('./HTTP/http.server');
var UDPServer = require('./UDP/udp.server');
var xSentMessage = require('./xSentMessage');
var xSentMessageMwParam = require('./xSentMessageMwParam');
var Transport = (function () {
    /**
     * Transport layer. This layer is an abstraction above all different sorts of communication.
     */
    function Transport(xyz) {
        this.xyz = xyz;
        this.routes = {};
        this.servers = {};
        var callDispatchMiddlewareStack = new GenericMiddlewareHandler(this.xyz, 'call.dispatch.mw', 'CALL');
        callDispatchMiddlewareStack.register(-1, require('./Middlewares/call/http.export.middleware'));
        this.registerRoute('CALL', callDispatchMiddlewareStack);
    }
    Transport.prototype.inspect = function () {
        var ret = wrapper('green', wrapper('bold', 'outgoing middlewares')) + ":\n";
        for (var route in this.routes) {
            ret += "    " + this.routes[route].inspect() + "\n";
        }
        ret += '\n';
        for (var s in this.servers) {
            ret += "  " + wrapper('bold', wrapper('magenta', this.servers[s].constructor.name + ' @ ' + s)) + " ::\n";
            ret += "    " + this.servers[s].inspect() + "\n";
        }
        return ret;
    };
    Transport.prototype.inspectJSON = function () {
        var ret = { 'outgoingRoutes': [], servers: [] };
        for (var route in this.routes) {
            ret.outgoingRoutes.push(this.routes[route].inspectJSON());
        }
        for (var s in this.servers) {
            ret.servers.push(this.servers[s].inspectJSON());
        }
        return ret;
    };
    /**
     *
     * opt should have:
     *   - node {string} address of destination,
     *   - route {string} url of outgoing middleware stack
     *   - payload {object}. depending on `route` , it can have `userPayload`, `service` or `_id`
     * @param opt {Obeject} the options object.
     * @param responseCallback {Function} the callback of the message. Note that this is valid
     * only for http calls. UDP / TCP calls do not have a callback
     */
    Transport.prototype.send = function (opt, responseCallback) {
        opt.route = opt.route || 'CALL';
        if (!this.routes[opt.route]) {
            logger.error("attempting to send message in route " + opt.route + ". DOES NOT EXIST");
            responseCallback('outgoing message route not found', null);
            return;
        }
        var _port;
        // TODO: BUG
        // here we are assuming that a route is unique in each NODE, not server
        // it should be checked...
        if (opt.redirect) {
            _port = this._findTargetPort(opt.route, opt.node);
            if (_port === -1) {
                logger.error("Transport Client :: could not find route " + opt.route + " in destination node " + opt.node + ". aborting transmission");
                if (responseCallback) {
                    responseCallback('target port/route not found', null);
                }
                return;
            }
        }
        var message = {
            userPayload: opt.payload,
            xyzPayload: {
                senderId: this.xyz.id().netId,
                service: opt.service
            }
        };
        // the json key
        var xMessage = new xSentMessage(message);
        var requestConfig = {
            hostname: "" + opt.node.split(':')[0],
            port: _port || "" + opt.node.split(':')[1],
            path: "/" + opt.route,
            method: 'POST',
            json: xMessage
        };
        // mw param
        var xMessageParam = new xSentMessageMwParam({
            requestConfig: requestConfig,
            responseCallback: responseCallback
        });
        logger.debug(wrapper('bold', 'Transport Client') + " :: sending message to " + wrapper('bold', requestConfig.hostname) + ":" + requestConfig.port + "/" + opt.route + " through " + this.routes[opt.route].name + " middleware :: message " + JSON.stringify(xMessage));
        this.routes[opt.route].apply(xMessageParam, 0);
    };
    Transport.prototype.registerServer = function (type, port, e) {
        var server;
        if (type === 'HTTP') {
            server = new HTTPServer(this.xyz, port);
            this.servers[Number(port)] = server;
            CONFIG.addServer({ type: type, port: port, event: e });
            return server;
        }
        else if (type === 'UDP') {
            server = new UDPServer(this.xyz, port);
            this.servers[Number(port)] = server;
            CONFIG.addServer({ type: type, port: port, event: e });
            return server;
        }
        else {
            logger.error("transport server type " + type + " undefined");
            return false;
        }
    };
    /**
     * Creates a new client route
     * @param {String} prefix
     * @param {Object} [gmwh] The GenericMiddlewareHandler instance to use for
     * this route. will create a new one if not provided.
     *
     */
    Transport.prototype.registerRoute = function (prefix, gmwh) {
        logger.info("Transport :: new outgoing message route " + wrapper('bold', prefix) + " added");
        if (gmwh) {
            this.routes[prefix] = gmwh;
        }
        else {
            logger.warn("Transport :: no middlewareHandler defined for route " + prefix + ". an empty one will be used");
            this.routes[prefix] = new GenericMiddlewareHandler(this.xyz, prefix + ".dispatch.mw", prefix);
        }
        return 1;
    };
    /**
     * Removes a client route
     */
    Transport.prototype.removeRoute = function (prefix) {
        if (this.routes[prefix]) {
            delete this.routes[prefix];
            logger.info("TRANSPORT :: route " + prefix + " removed.");
            return 1;
        }
        else {
            logger.error("TRANSPORT :: attempting to remove route " + prefix + " which does not exist.");
            return -1;
        }
    };
    Transport.prototype.getServerRoutes = function () {
        var ret = {};
        for (var s in this.servers) {
            ret[s] = Object.keys(this.servers[s].routes);
        }
        return ret;
    };
    Transport.prototype._findTargetPort = function (route, node) {
        var foreignRoutes = this.xyz.serviceRepository.foreignRoutes[node];
        for (var p in foreignRoutes) {
            for (var _i = 0, _a = foreignRoutes[p]; _i < _a.length; _i++) {
                var r = _a[_i];
                if (r === route) {
                    return p;
                }
            }
        }
        return -1;
    };
    Transport.prototype._checkUniqueRoute = function (prefix) {
        for (var s in this.servers) {
            for (var r in this.servers[s].routes) {
                if (r === prefix) {
                    return false;
                }
            }
        }
        return true;
    };
    return Transport;
}());
module.exports = Transport;
