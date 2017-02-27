const ServiceRepository = require('./src/Service/service.repository')
let CONFIG = require('./src/Config/config.global')
let logger = require('./src/Log/Logger')
let pingBoostrap = require('./src/Bootstrap/ping.basic')
let wrapper = require('./src/Util/Util').wrapper
let machineReporter = require('./src/Util/machine.reporter')
let inspectBootstrap = require('./src/Bootstrap/process.inspect.event')
let networkMonitorBootstrap = require('./src/Bootstrap/process.network.event')
// Detail about system Conf keys
// TODO
class NodeXYZ {

  // an example of the configuration requried can be found in CONSTANTS.js file.
  // Note that if you do not set a value, they'll be replaced.
  constructor (configuration, cmdLineArgs) {
    CONFIG.setSelfConf(configuration.selfConf, cmdLineArgs)
    CONFIG.setSystemConf(configuration.systemConf)

    this.selfConf = CONFIG.getSelfConf()

    // just for logging convention
    global._serviceName = this.id()._identifier

    // Global exported functions and modules
    this.CONFIG = CONFIG
    this.logger = logger
    this.path = require('./src/Service/path')
    this.CONSTANTS = require('./src/Config/Constants')
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
      logger.verbose('sending config info for possible xyz-cli listener instance')
      if (!process.send) {
        logger.error('IPC channel not open. failed to communicate with cli')
        return
      }
      process.send({ title: 'init', body: this.selfConf})

      // note that not only that these two are used by cli's `top` command,
      // they are actually no use when cli is not working
      // since messaging (IPC channel) is disabled
      this.bootstrap(inspectBootstrap)
      this.bootstrap(networkMonitorBootstrap)
    }
  }

  /**
   * Extents the default `console.log` method
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
   * Stop XYZ system. will stop all ping and communication requests.
   *  Should onle be used with tests.
   */
  terminate () {
    this.serviceRepository.terminate()
  }

  /**
   * Register a new function to be exported.
   * @param  {String}   servicePath       Unique path for this service.
   * @param  {Function} fn                Handler function for this service
   */
  register (servicePath, fn) {
    this.serviceRepository.register(servicePath, fn)
  }

  /**
   * call a service
   * uses the default /call route
   * opt is an object with keys like :
   * - `servicePath`: {String}
   * - `sendStrategy`: {function}
   * - `payload`: {Object|Number|Boolean}
   * - `route`
   * - `destPort`
   */
  call (opt, responseCallback) {
    this.serviceRepository.call(opt, responseCallback)
  }

  // apply a bootstrap function to xyz
  bootstrap (fn, ...args) {
    this.bootstrapFunctions.push(fn.name)
    fn(this, ...args)
  }

  // for now, only one middleware should be added to this. no more.
  setSendStrategy (fn) {
    this.serviceRepository.callDispatchMiddlewareStack.middlewares = []
    this.serviceRepository.callDispatchMiddlewareStack.register(0, fn)
  }

  //  Return an object of all middleware handlers available in the system. Each can be modified while
  //  bootstraping or at runtime. See Middleware section for more details. <br>
  //  returns an Object of middleware handlers.
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

  registerServerRoute (port, prefix, gmwh) {
    return this.serviceRepository.transport.servers[port].registerRoute(prefix, gmwh)
  }

  registerClientRoute (prefix, gmwh) {
    return this.serviceRepository.transport.registerRoute(prefix, gmwh)
  }

  registerServer (type, port, e) {
    return this.serviceRepository.registerServer(type, port, e)
  }

  id () {
    return {
      name: CONFIG.getSelfConf().name,
      host: CONFIG.getSelfConf().host,
      port: CONFIG.getSelfConf().transport[0].port,
      _identifier: `${CONFIG.getSelfConf().name}@${CONFIG.getSelfConf().host}:${CONFIG.getSelfConf().transport[0].port}`
    }
  }
}

module.exports = NodeXYZ
