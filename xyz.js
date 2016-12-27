const ServiceRepository = require('./src/Service/service.repository')
let CONFIG = require('./src/Config/config.global')
let logger = require('./src/Log/Logger')
let argParser = require('./src/Util/commandline.parser')
let pingBoostrap = require('xyz.ping.default.bootstrap')
let wrapper = require('./src/Util/Util').wrapper

// Detail about system Conf keys
// TODO
class NodeXYZ {
  // an example of the configuration requried can be found in CONSTANTS.js file.
  // Note that if you do not set a value, they'll be replaced.
  constructor (configuration) {
    CONFIG.setSelfConf(configuration.selfConf)
    CONFIG.setSystemConf(configuration.systemConf)

    /*
    just for logging convention
     */
    global._serviceName = `${CONFIG.getSelfConf().name}@${CONFIG.getSelfConf().host}:${CONFIG.getSelfConf().port}`

    /*
    Global exported functions and modules
     */
    this.CONFIG = CONFIG
    this.logger = logger
    this.path = require('./src/Service/path')
    this.CONSTANTS = require('./src/Config/Constants')
    this.Util = require('./src/Util/Util')

    this.serviceRepository = new ServiceRepository(this)

    if (CONFIG.getSelfConf().defaultBootstrap) {
      this.bootstrap()
    }
  }

  inspect () {
    let pref = `
____________________  GLOBAL ____________________
${wrapper('bold', wrapper('blue', 'selfConfig'))}:
  ${JSON.stringify(CONFIG.getSelfConf(), null, 2)}
${wrapper('bold', wrapper('blue', 'systemConf'))}:
  ${JSON.stringify(CONFIG.getSystemConf(), null, 2)}
____________________  SERVICE REPOSITORY ____________________
${this.serviceRepository._inspect()}
____________________  TRANSPORT LAYER ____________________
${wrapper('bold', wrapper('blue', 'Transport Client'))}:
  ${this.serviceRepository.transportClient._inspect()}
${wrapper('bold', wrapper('blue', 'Transport Server'))}:
  ${this.serviceRepository.transportServer._inspect()}
`

    // for (let mw of this.serviceRepository.callDispatchMiddlewareStack.middlewares) {
    //   pref += `          ${mw.name}`
    // }

    return pref
  }

  //  Stop XYZ system. will stop all ping and communication requests.
  //  Should onle be used with tests.
  terminate () {
    this.serviceRepository.terminate()
  }

  //  Register a new function to be exported.
  //  @param  {String}   serviceName       Unique name for this service.
  //  @param  {Function} fn                Handler function for this service
  register (serviceName, fn) {
    this.serviceRepository.register(serviceName, fn)
  }

  // Call a service
  //
  // Parameters : <br>
  // `servicePath` should be a valid funciton path on a remote or local host <br>
  // `userPayload` can be any premetive type <br>
  // `responseCallback` should be the function passed by the used
  // `sendStrategy` is optional and can be anything like send to all or first find.
  call (serviceName, userPayload, responseCallback, sendStrategy) {
    this.serviceRepository.call(serviceName, userPayload, responseCallback, sendStrategy)
  }

  // default bootstrap function is xyz core. This function will be called
  // if `defaultBootstrap` key in selfConf is set to true
  bootstrap () {
    pingBoostrap(this)
  }

  setSendStrategy (fn) {
    // for now, only one middleware should be added to this. no more.
    this.serviceRepository.callDispatchMiddlewareStack.middlewares = []
    this.serviceRepository.callDispatchMiddlewareStack.register(0, fn)
  }

  //  Return an object of all middleware handlers available in the system. Each can be modified while
  //  bootstraping or at runtime. See Middleware section for more details. <br>
  //  returns an Object of middleware handlers.
  middlewares () {
    return {
      transport: {
        callReceive: this.serviceRepository.getTransportLayer().Server.callReceiveMiddlewareStack,
        callDispatch: this.serviceRepository.getTransportLayer().Client.callDispatchMidllewareStack
      },
      serviceRepository: {
        callDispatch: this.serviceRepository.callDispatchMiddlewareStack
      }
    }
  }
}

module.exports = NodeXYZ
