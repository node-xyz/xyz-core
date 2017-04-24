var __extends = (this && this.__extends) || (function () {
  var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p] }
  return function (d, b) {
    extendStatics(d, b)
    function __ () { this.constructor = d }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __())
  }
})()
Object.defineProperty(exports, '__esModule', { value: true })
var Util_1 = require('./../../Util/Util')
var Logger_1 = require('./../../Log/Logger')
var config_global_1 = require('./../../Config/config.global')
var generic_middleware_handler_1 = require('./../../Middleware/generic.middleware.handler')
var events_1 = require('events')
var dgram = require('dgram')
var UDPServer = (function (_super) {
  __extends(UDPServer, _super)
  function UDPServer (xyz, port) {
    var _this = _super.call(this) || this
    _this.port = port
    _this.xyz = xyz
        /**
         * Each server should have this attribute and pass it to the constructor of
         * xMiddlewareParam object
         */
    _this.serverId = {
      type: 'UDP',
      port: port
    }
    _this.server = dgram.createSocket('udp4')
    _this.routes = {}
    _this.server.on('listening', function () {
      var address = _this.server.address()
      Logger_1.logger.info('UDP Server listening on port ' + address.address + ':' + address.port)
    })
            .on('message', function (message, remote) {
              var _message = JSON.parse(message.toString())
              for (var route in _this.routes) {
                if (_message.xyzPayload.route === '/' + route) {
                  Logger_1.logger.debug('UDP SERVER @ ' + _this.port + ' :: udp message received for /' + Util_1.wrapper('bold', route) + ' [' + JSON.stringify(_message) + ']')
                  var xMessage = {
                    message: _message,
                    response: undefined,
                    serverId: _this.serverId,
                    meta: remote
                  }
                  _this.routes[route].apply(xMessage, 0)
                  break
                }
              }
            })
            .bind(port, config_global_1.CONFIG.getSelfConf().host)
    return _this
  }
  UDPServer.prototype.inspect = function () {
    var ret = Util_1.wrapper('green', Util_1.wrapper('bold', 'Middlewares')) + ':\n'
    for (var route in this.routes) {
      ret += '    ' + this.routes[route].inspect() + '\n'
    }
    return ret
  }
  UDPServer.prototype.inspectJSON = function () {
    var ret = []
    for (var route in this.routes)
      ret.push(this.routes[route].inspectJSON())
    return ret
  }
    /**
     * Will close the server. duplicate of `.terminate()`
     */
  UDPServer.prototype.close = function () {
    this.server.close()
  }
    /**
     * Will close the server
     */
  UDPServer.prototype.terminate = function () {
    Logger_1.logger.warn('UDP SERVER @ ' + this.port + ' :: CLOSING')
    this.close()
  }
    // will initialize a new route with one default middleware
    // NOTE: this is experimental and there is no support to send sth directly to this
    // from whithin xyz. this is designed mostly for users outside of the system to have
    // a communication way
  UDPServer.prototype.registerRoute = function (prefix, gmwh) {
    var globalUnique = this.xyz.serviceRepository.transport._checkUniqueRoute(prefix)
    if (!globalUnique) {
      Logger_1.logger.error('UDP Server @ ' + this.port + ' :: route ' + prefix + ' is not unique.')
      return false
    }
    else {
      gmwh = gmwh || new generic_middleware_handler_1.GenericMiddlewareHandler(this.xyz, prefix + '.receive.mw', prefix)
      this.routes[prefix] = gmwh
      Logger_1.logger.info('UDP Server @ ' + this.port + ' :: new message route ' + Util_1.wrapper('bold', prefix) + ' added')
      return 1
    }
  }
  return UDPServer
}(events_1.EventEmitter))
exports.default = UDPServer
