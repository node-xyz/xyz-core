const ServiceRepository = require('./src/Service/service.repository')
let CONFIG = require('./src/Config/config.global')
const logger = require('./src/Log/Logger')
const pingBoostrap = require('./src/Bootstrap/ping.basic')
const wrapper = require('./src/Util/Util').wrapper
const machineReporter = require('./src/Util/machine.reporter')
const inspectBootstrap = require('./src/Bootstrap/process.inspect.event')
const networkMonitorBootstrap = require('./src/Bootstrap/process.network.event')

/**
 * The main class of xyz-core. Most of the functions that the user should work with
 * live inside this class.
 */
class NodeXYZ {

  /**
   * create a new xyz object
   * @param {Object} configuration configuration should have two main keys:
   *   - selfConf
   *   Will contain information about this node. important keys are **name**, **transport** and **host**
   *   - systemConf
   *   Will contain information about the system. The only key is **nodes**
   *   If `selfConf` or `systemConf` is not fully filled, the default values
   *   in [Constants.js](/apidoc/constants.html) will be used.
   * @param {Object} cmdLineArgs a backdoor to inject paramters with high priority
   * to the constructor, just as if they were passed to `node [filnename].js --xyz-name foo ...`.
   * These configuration will only override the `selfConf` key and should be an object,
   * not a string with `--xyz-` prefix. Example: `{name: 'foo'}`
   */
  constructor (configuration, cmdLineArgs) {
    CONFIG.setSelfConf(configuration.selfConf, cmdLineArgs)
    CONFIG.setSystemConf(configuration.systemConf)

    this.selfConf = CONFIG.getSelfConf()

    // just for logging convention
    global._serviceName = this.id()._identifier

    // Global exported functions and modules

    /**
     * A reference to the config object of the node
     * @type {Object}
     */
    this.CONFIG = CONFIG

    /**
     * Reference to the xyz's internal logger
     * @type {Object}
     */
    this.logger = logger

    /**
     * Reference to the path class. Note that this is static and it can be imported
     * from the xyz-core module too.
     * @type {Object}
     */
    this.path = require('./src/Service/path')

    /**
     * Reference to the constant values of xyz
     * @type {Object}
     */
    this.CONSTANTS = require('./src/Config/Constants')

    /**
     * reference to the util object
     * @type {Object}
     */
    this.Util = require('./src/Util/Util')
    this.gmwh = require('./src/Middleware/generic.middleware.handler')

    this.serviceRepository = new ServiceRepository(this)
    this.bootstrapFunctions = []

    // lunch the default bootstrat.
    // Note that if you ever decide to override defaultBootstrap, you MUST manually apply `pingBoostrap` in it
    // otherwise the service discovery mechanism will not work
    if (this.selfConf.defaultBootstrap) {
      this.bootstrap(pingBoostrap, this.selfConf.cli.enable, this.selfConf.transport[0].port)
    }

    // send an inti message to the cli process
    if (this.selfConf.cli.enable) {
      logger.verbose('XYZ :: sending config info for possible xyz-cli listener instance')
      if (!process.send) {
        logger.error('XYZ :: IPC channel not open. failed to communicate with cli')
        return
      }
      process.send({title: 'init', body: this.selfConf})

      // note that not only that these two are used by cli's `top` command,
      // they are actually no use when cli is not working
      // since messaging (IPC channel) is disabled
      this.bootstrap(inspectBootstrap)
      this.bootstrap(networkMonitorBootstrap)
    }
  }

  /**
   * Extents the default `console.log` method. Will show all important imformations
   * of a node
   */
  inspect () {
    let pref = `
____________________  GLOBAL ____________________
${wrapper('bold', wrapper('blue', 'selfConfig'))}:
  ${JSON.stringify(this.selfConf, null, 2)}
${wrapper('bold', wrapper('blue', 'systemConf'))}:
  ${JSON.stringify(CONFIG.getSystemConf(), null, 2)}
${wrapper('bold', wrapper('blue', 'Bootstrap Functions'))}:
  ${this.bootstrapFunctions}
____________________  SERVICE REPOSITORY ____________________
${this.serviceRepository.inspect()}
____________________  TRANSPORT LAYER ____________________
${wrapper('bold', wrapper('blue', 'Transport'))}:
  ${this.serviceRepository.transport.inspect()}
`
    return pref
  }

  /**
   * returns the info printed by `inspect` in JSON format
   */
  inspectJSON () {
    return {
      global: {
        systemConf: CONFIG.getSystemConf(),
        selfConf: this.selfConf,
        bootstrapFunctions: this.bootstrapFunctions,
        machineReport: {
          cpu: machineReporter.getCPU(),
          mem: machineReporter.getMem(),
          pid: machineReporter.PID()
        }
      },
      ServiceRepository: this.serviceRepository.inspectJSON(),
      Transport: this.serviceRepository.transport.inspectJSON()
    }
  }

  /**
   * Stop XYZ system. will call service layer's terminate function. see that for more info
   */
  terminate () {
    this.serviceRepository.terminate()
  }

  /**
   * Register a new function to be exported for message calls.
   * @param  {String}   servicePath       Unique path for this service.
   * @param  {Function} fn                Handler function for this service
   * see [Service layer register method](/apidoc/ServiceRepository.html#register) for more info
   */
  register (servicePath, fn) {
    return this.serviceRepository.register(servicePath, fn)
  }

  /**
   * call a service
   * uses the default /call route
   *
   * @param {Object} opt is an object with keys like :
   * - `servicePath`: {String} the path of the service. Note that the initial `/`
   * is not needed and will be added by default.
   * - `sendStrategy`: {Function} optional send strategy. If not filled, the `defaultSendStrategy` in
   * `selfConf` will be used.
   * - `payload`: {Object|Number|Boolean|Array} the payload passed to the callee
   * - `route` : Indicates the route ~ outgoing middleware of the message. By default the default `CALL` route is used
   * - `redirect`: If filled `true` The Transport layer will try to overrdide the destination's `port` when sending the message
   * As an example, a `sendStrategy` might resolve `192.168.0.10:5000` as the destination fo a message, but the message's
   * outgoing middleware uses `_udpExport` hence the message should be sent to destination's udp server, which might be `192.168.0.10:5001`.
   *
   * @param responseCallback {Function} the callback for when the callee responds to the message.
   * Note that this depends on the underlying transport used
   */
  call (opt, responseCallback) {
    this.serviceRepository.call(opt, responseCallback)
  }

  /**
  * apply a bootstrap function to xyz
  * @param {function} fn the bootstrap function
  * @param {Any} ...args the arguments passed to the bootstrap function
  * Note that the first paramters of any bootstrap function is always the xyz instnace
  * and the rest is filled with `..args`.
  */
  bootstrap (fn, ...args) {
    this.bootstrapFunctions.push(fn.name)
    fn(this, ...args)
  }

  /**
  * will override the sendstrategy permanently
  * @param {Function} fn the new sendStrategy
  */
  setSendStrategy (fn) {
    this.serviceRepository.callDispatchMiddlewareStack.middlewares = []
    this.serviceRepository.callDispatchMiddlewareStack.register(0, fn)
  }

  /**
   *
   * Return an object of all middleware handlers available in the system. Each can be modified while
   * bootstraping or at runtime. The returned object has two keys:
   * - `transport`:
   * - `serviceRepository`
   *
   * Example ussage :
   *
   * Get the transport layer middleware for outgoing route **CALL**
   *
   * `xyz.middlewares().transport.client("CALL")`
   *
   * Get the transport layer middleware for server at port 5000 and incomming route **FOO**
   *
   * `xyz.middleware().transport.server("FOO")(5000)`
   *
   * see the source code for more inormation
   */
  middlewares () {
    return {
      transport: {
        client: (prefix) => this.serviceRepository.transport.routes[prefix],
        server: (prefix) => (port) => this.serviceRepository.transport.servers[port].routes[prefix]
      },
      serviceRepository: {
        callDispatch: this.serviceRepository.callDispatchMiddlewareStack
      }
    }
  }

  /**
  * Register a new server route
  * @param {Number} port will indicate the port of the target server
  * @param {String} prefix will indicate the route prefix of the target server
  * @param {Object} [gmwh] an instance of the `GenericMiddlewareHandler` class.
  * if not filled, an empty middleware will be created for this route.
  * @return {Number} 1 if success, -1 if fail
  */
  registerServerRoute (port, prefix, gmwh) {
    return this.serviceRepository.transport.servers[port].registerRoute(prefix, gmwh)
  }

  /**
  * Register a new outgoing message route
  * @param {String} prefix the route prefix
  * @param {Object} [gmwh] an instance of the `GenericMiddlewareHandler` class.
  * if not filled, an empty middleware will be created for this route.
  *
  * @return {Number} 1 if success, -1 if fail
  */
  registerClientRoute (prefix, gmwh) {
    return this.serviceRepository.transport.registerRoute(prefix, gmwh)
  }

  /**
   * Will remove a outgoing route
   * @param {String} prefix the prefix of the route
   * @return {Number} statuscode. 1 if success and -1 if fail
   */
  removeClientRoute (prefix) {
    return this.serviceRepository.transport.removeRoute(prefix)
  }

  /**
  * create and register a new server. After cretaing a server with this port
  * you can access its middlewares with the given port.
  *
  * @param {String} type type of the server. Must be `UDP` or `HTTP`
  * @param {Number} port the port of the newly created server.
  * @param {Boolean} [e=true] . Event binding. when filled true, if one of the middlewares in
  * server emits the message `xyz_message` (see `CONSTANTS.events`) it will be received by service layer
  * and appropriate function, if registered will be called.
  */
  registerServer (type, port, e = true) {
    return this.serviceRepository.registerServer(type, port, e)
  }

  /**
   * Will remove a server from a given port
   * will cause:
   *   - The listener to be removed if activated before
   *   - The server to stop listening
   *   - all of the routes and middleware to be destroyed
   * @param {Number} port port to remove the server.
   */
  removeServer (port) {
    if (this.serviceRepository.transport.servers[port]) {
      this.serviceRepository.transport.servers[port].close()
      delete this.serviceRepository.transport.servers[port]
      logger.info(`XYZ :: server on port ${port} removed. Removing from selfConf...`)
      CONFIG.removeServer(port)
    } else {
      logger.error(`XYZ :: attempting to remove server ${port} that does not exist`)
      return -1
    }
  }

  /**
  * return the identification paramters of the node.
  * note that all ping mechanisms should used `xyz.id()._dentifier` as a node's identifier.
  * this value is `[NAME]@[HOST]:[PORT OF THE FIRST SERVER]`.
  *
  * the port of the first server is always the **primary** port of a node.
  *
  * @return {Object}
  */
  id () {
    return {
      name: CONFIG.getSelfConf().name,
      host: CONFIG.getSelfConf().host,
      port: CONFIG.getSelfConf().transport[0].port,
      netId: `${CONFIG.getSelfConf().host}:${CONFIG.getSelfConf().transport[0].port}`,
      _identifier: `${CONFIG.getSelfConf().name}@${CONFIG.getSelfConf().host}:${CONFIG.getSelfConf().transport[0].port}`
    }
  }
}

module.exports = NodeXYZ
