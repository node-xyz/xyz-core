const ServiceRepository = require('./src/Service/service.repository')
let CONFIG = require('./src/Config/config.global')
let logger = require('./src/Log/Logger')
let pingBoostrap = require('xyz.ping.default.bootstrap')
let wrapper = require('./src/Util/Util').wrapper
let machineReporter = require('./src/Util/machine.reporter')

// Detail about system Conf keys
// TODO
class NodeXYZ {
  // an example of the configuration requried can be found in CONSTANTS.js file.
  // Note that if you do not set a value, they'll be replaced.
  constructor (configuration) {
    CONFIG.setSelfConf(configuration.selfConf)
    CONFIG.setSystemConf(configuration.systemConf)

    // just for logging convention
    global._serviceName = `${CONFIG.getSelfConf().name}@${CONFIG.getSelfConf().host}:${CONFIG.getSelfConf().port}`

    // Global exported functions and modules
    this.CONFIG = CONFIG
    this.logger = logger
    this.path = require('./src/Service/path')
    this.CONSTANTS = require('./src/Config/Constants')
    this.Util = require('./src/Util/Util')

    this.serviceRepository = new ServiceRepository(this)
    this.bootstrapFunctions = []

    // lunch the default bootstrat.
    // Note that if you ever decide to override defaultBootstrap, you MUST manually apply `pingBoostrap` in it
    // otherwise the service discovery mechanism will not work
    if (CONFIG.getSelfConf().defaultBootstrap) {
      this.bootstrap(pingBoostrap)
    }

    // send an inti message to the cli process
    if (CONFIG.getSelfConf().cli.enable) {
      logger.verbose(`sending config info for possible xyz-cli listener instance`)
      process.send({ title: 'init', body: CONFIG.getSelfConf()})

      this.bindProcessEvents()
    }
  }

  // override the default `console.log()` behavior
  inspect () {
    let pref = `
____________________  GLOBAL ____________________
${wrapper('bold', wrapper('blue', 'selfConfig'))}:
  ${JSON.stringify(CONFIG.getSelfConf(), null, 2)}
${wrapper('bold', wrapper('blue', 'systemConf'))}:
  ${JSON.stringify(CONFIG.getSystemConf(), null, 2)}
${wrapper('bold', wrapper('blue', 'Bootstrap Functions'))}:
  ${this.bootstrapFunctions}
____________________  SERVICE REPOSITORY ____________________
${this.serviceRepository._inspect()}
____________________  TRANSPORT LAYER ____________________
${wrapper('bold', wrapper('blue', 'Transport Client'))}:
  ${this.serviceRepository.transportClient._inspect()}
${wrapper('bold', wrapper('blue', 'Transport Server'))}:
  ${this.serviceRepository.transportServer._inspect()}
`
    return pref
  }

  inspectJSON () {
    return {
      global: {
        systemConf: CONFIG.getSystemConf(),
        selfConf: CONFIG.getSelfConf(),
        bootstrapFunctions: this.bootstrapFunctions,
        machineReport: {
          cpu: machineReporter.getCPU(),
          mem: machineReporter.getMem(),
          pid: machineReporter.PID()
        }
      },
      ServiceRepository: this.serviceRepository.inspectJSON(),
      Transport: {
        transportClient: this.serviceRepository.transportClient._inspectJSON(),
        transportServer: this.serviceRepository.transportServer._inspectJSON()
      }
    }
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

  // call a service
  //
  // opt is an object with keys like :
  //   - servicePath: {String}
  //   - sendStrategy: {function}
  //   - payload: {Object|Number|Boolean}
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
        callReceive: this.serviceRepository.getTransportLayer().Server.callReceiveMiddlewareStack,
        callDispatch: this.serviceRepository.getTransportLayer().Client.callDispatchMiddlewareStack,

        pingDispatch: this.serviceRepository.getTransportLayer().Client.pingDispatchMiddlewareStack,
        pingReceive: this.serviceRepository.getTransportLayer().Client.pingReceiveMiddlewareStack,

        joinReceive: this.serviceRepository.getTransportLayer().Client.joinReceiveMiddlewareStack,
        joinDispatch: this.serviceRepository.getTransportLayer().Client.joinDispatchMiddlewareStack

      },
      serviceRepository: {
        callDispatch: this.serviceRepository.callDispatchMiddlewareStack
      }
    }
  }

  // bing some events for the cli communication. should be called only when
  // cli : { enable : true }
  // in selfConf
  bindProcessEvents () {
    process.on('message', (data) => {
      console.log('message passing', data)
      // inspect
      // this process will responde with a json object containing basic info about the node
      if (data.title === 'inspectJSON') {
        process.send({title: data.title, body: this.inspectJSON()})
      } else if (data.title === 'inspect') {
        process.send({title: data.title, body: this.inspect()})
      }
    })
  }
}

module.exports = NodeXYZ
