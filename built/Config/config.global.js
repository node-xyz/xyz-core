/**
 * This module is available throughout xyz using `xyz.CONFIG`. It sores important information
 * about the node and the system. Most of the properties are read-only and should be updated ONLY using
 * defined methods.
 *
 * @module Configuration
 */
Object.defineProperty(exports, '__esModule', { value: true })
var argParser = require('./../Util/commandline.parser')
var Logger_1 = require('./../Log/Logger')
var Constants_1 = require('./Constants')
var systemConf
var selfConf
function MergeRecursive (obj1, obj2) {
  for (var p in obj2) {
    try {
      if (obj2[p].constructor === Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p])
      }
      else {
        obj1[p] = obj2[p]
      }
    }
        catch (e) {
          obj1[p] = obj2[p]
        }
  }
  return obj1
}
exports.CONFIG = {
    /**
     * should be called to inform that a new node has joined the system.
     * This will log the results automatically.
     * Note that a middleware or bootstrap function should call a method with the
     * same name in `serviceRepository` layer. This method should not be called directly.
     * @method joinNode
     * @param  {String} aNode netId of a node
     * @return {Number} 1 if ok, -1 if fail.
     */
  joinNode: function (aNode) {
    if (systemConf.nodes.indexOf(aNode) > -1) {
      Logger_1.logger.warn('Node ' + aNode + ' already in systemConf. Passing.')
      return -1
    }
    else {
      Logger_1.logger.info('A new node {' + aNode + '} added to systemConf')
      systemConf.nodes.push(aNode)
      return 1
    }
  },
    /**
     * Similar to joinNode(). The only difference is that it will not log a warning
     * if a node already exists.
     * Note that a middleware or bootstrap function should call a method with the
     * same name in `serviceRepository` layer. This method should not be called directly.
     * @method ensureNode
     * @param  {String}   aNode netId of a node
     * @return {Number}   1 if ok, -1 if fail.
     */
  ensureNode: function (aNode) {
    if (systemConf.nodes.indexOf(aNode) === -1) {
      Logger_1.logger.info('CONFIG :: A new node {' + aNode + '} added to systemConf')
      systemConf.nodes.push(aNode)
      return 1
    }
    return -1
  },
    /**
     * should be called to inform that a node has left the system.
     * This will log the results automatically.
     * Note that a middleware or bootstrap function should call a method with the
     * same name in `serviceRepository` layer. This method should not be called directly.
     * @method joinNode
     * @param  {String} aNode netId of a node
     * @return {Number} 1 if ok, -1 if fail.
     */
  kickNode: function (aNode) {
    var index = systemConf.nodes.indexOf(aNode)
    if (index > -1) {
      Logger_1.logger.warn('node ' + aNode + ' removed from systemConf.')
      systemConf.nodes.splice(systemConf.nodes.indexOf(aNode), 1)
      return 1
    }
    else {
      Logger_1.logger.warn('CONFIG :: Attempting to remove ' + aNode + ' which does not exist')
      return -1
    }
  },
    /**
     * a Duplicate function to joinNode. The only difference is logging and the fact
     * that this one takes an array of nodes
     * @param  {String} someNodes a list of nodes
     */
  ensureNodes: function (someNodes) {
    for (var _i = 0, someNodes_1 = someNodes; _i < someNodes_1.length; _i++) {
      var aNode = someNodes_1[_i]
      if (systemConf.nodes.indexOf(aNode) === -1) {
        Logger_1.logger.info('CONFIG :: A new node {' + aNode + '} added to systemConf')
        systemConf.nodes.push(aNode)
      }
    }
  },
    /**
     * will override the configurations passed to XYZ constructor inside internal variable.
     * Note that the `xyz.js` constructor should call this and there is no other use case for it.
     * @method setSelfConf
     * @param  {Object}    aConf       Object with the same format of xyz's constructor `selfConf`
     * @param  {String}    cmdLineArgs Manual command line arguments. When this has a value, it will be
     * used insteat of process.argv[1]
     */
  setSelfConf: function (aConf, cmdLineArgs) {
    Logger_1.logger.info('CONFIG :: Setting default selfConf')
    selfConf = Constants_1.CONSTANTS.defaultConfig.selfConf
    Logger_1.logger.info('CONFIG :: Reading selfConf from user')
    selfConf = MergeRecursive(selfConf, aConf)
    Logger_1.logger.info('CONFIG :: Reading selfConf from command line')
        // TODO use MergeRecursive function to get rid of this shitty code
        // this is to allow cli admin to inject some args like commandline arguments
    var args = cmdLineArgs ? cmdLineArgs : argParser.xyzGeneric()
    for (var arg in args) {
      Logger_1.logger.verbose('CONFIG :: overriding selfConf.' + arg + ' from command line value {' + args[arg] + '}')
      var keys = arg.split('.')
            // ensure that port is Number not String
      if (keys.length === 3 && keys[2] === 'port') {
        args[arg] = Number(args[arg])
      }
            // length 1
      if (keys.length === 1) {
        if (keys[0] === 'seed') {
          selfConf[keys[0]].push(args[arg])
        }
        else if (keys[0] === 'defaultBootstrap') {
                    // could also use eval here
          if (args[arg] === '0' || args[arg] === 'false') {
            selfConf[keys[0]] = false
          }
          else {
            selfConf[keys[0]] = true
          }
        }
                else {
          selfConf[keys[0]] = args[arg]
        }
      }
      else if (keys.length === 2) {
        if (!selfConf[keys[0]])
          selfConf[keys[0]] = {}
        selfConf[keys[0]][keys[1]] = keys[1] === 'enable' ? eval(args[arg]) : args[arg]
      }
            else if (keys.length === 3) {
              if (!selfConf[keys[0]])
                selfConf[keys[0]] = {}
              if (!selfConf[keys[0]][keys[1]])
                selfConf[keys[1]] = {}
              selfConf[keys[0]][keys[1]][keys[2]] = args[arg]
            }
            else {
              Logger_1.logger.error('CONFIG :: command line arguments with more than three sub-keys are not allowed. passing')
            }
    }
    Logger_1.logger.transports.console.level = selfConf.logLevel
    Logger_1.logger.debug('log level set to ' + Logger_1.logger.transports.console.level)
  },
    /**
     * Overrides the configuration's `systemConf` inside internal variables
     * @method setSystemConf
     * @param  {Object}      aConf systemConf with the same format like `xyz`'s constructor
     */
  setSystemConf: function (aConf) {
    Logger_1.logger.info('CONFIG :: Setting default systemConf')
    systemConf = Constants_1.CONSTANTS.defaultConfig.systemConf
    Logger_1.logger.info('CONFIG :: reading systemConf from user')
    systemConf = MergeRecursive(systemConf, aConf)
    Logger_1.logger.info('CONFIG :: Reading selfConf from command line')
    var args = argParser.xyzGeneric('--xys-')
    for (var arg in args) {
      Logger_1.logger.verbose('CONFIG :: overriding systemConf.' + arg + ' from command line value {' + args[arg] + '}')
      if (arg === 'node') {
        if (typeof (args[arg]) === 'object') {
          systemConf.nodes = systemConf.nodes.concat(args[arg])
        }
        else {
          systemConf.nodes.push(args[arg])
        }
      }
    }
    Logger_1.logger.debug('CONFIG :: Adding self to systemConf by default')
    if (systemConf.nodes.indexOf(selfConf.host + ':' + selfConf.transport[0].port) === -1) {
      systemConf.nodes.push(selfConf.host + ':' + selfConf.transport[0].port)
    }
  },
    /**
     * should be called to update the values of `selfConf.transport` when a new server is added.
     * Should be called from Transport layer, not directly.
     * @method addServer
     * @param  {Object}  aServer An object with keys `type`, `port` and `event`. Similar to `selfConf.transport`
     */
  addServer: function (aServer) {
    for (var _i = 0, _a = selfConf.transport; _i < _a.length; _i++) {
      var s = _a[_i]
      if (s.port === aServer.port) {
        Logger_1.logger.warn('CONFIG :: cannot add a server with port ' + aServer.port + ' to selfConf. already exists')
        return false
      }
    }
    Logger_1.logger.info('CONFIG :: new server ' + JSON.stringify(aServer) + ' added at runtime to selfConf')
    selfConf.transport.push(aServer)
  },
    /**
     * Will remove a server from the confg object
     * @method removeServer
     * @param  {Number}     aPort port of the server
     * @return {Boolean}           Status of the operation
     */
  removeServer: function (aPort) {
    for (var _i = 0, _a = selfConf.transport; _i < _a.length; _i++) {
      var s = _a[_i]
      if (aPort === s.port) {
        var index = selfConf.transport.indexOf(s)
        selfConf.transport.splice(index, 1)
        Logger_1.logger.info('CONFIG :: removing server ' + aPort + ' from selfConf.')
        return true
      }
    }
    Logger_1.logger.error('CONFIG :: server ' + aPort + ' could not be removed. Not exists')
    return false
  },
    /**
     * Will return the internal systemConf variable
     * @method getSystemConf
     * @return {Object}      node's `systemConf`
     */
  getSystemConf: function () { return systemConf },
    /**
     * will return the internal selfConf variable
     * @method getSelfConf
     * @return {Object}    node's `selfConf`
     */
  getSelfConf: function () { return selfConf },
    /**
     * Will cause the system to forget all of the nodes. Should not be used only in
     * test environemts
     * @method forget
     * @return {Null}
     */
  forget: function () { systemConf.nodes = [selfConf.host + ':' + selfConf.transport[0].port] }
}
