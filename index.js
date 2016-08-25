const ServiceRepository = require('./src/Service/service.repository')
let _CONFIG = require('./src/Config/config.global')
let _RSA = require('./src/Config/rsa.global')
let logger = require('./src/Log/Logger')
let argParser = require('./src/Util/commandline.parser')

/*
Todo see if using stream instead of events is better
Todo Support local clustering[Must hack with it first]
TODO add some sort of checking before waiting for body data
TODO integrate the flow of body/response/XResponse params on middlewares
TODO what happens when we early response using params[1].destory() but meanwhile call the next() ??
TODO start documention
TODO think about ways to remote deploy this ( +docker )
TODO implement any auth for call
TODO implement rsa auth for ping / call
TODO clean the cunstroctor and add a bootstrap()
 */


class NodeXYZ {
  /**
   * Create new XYZ object. all user APIs and method will be ported from this object
   * @param  {Object} configuration - an Object with format
   * - systemConf : file instance of system Configuration aka xyz.json
   */
  constructor(configuration) {
    _CONFIG.setServiceConf(configuration.serviceConf)
    _CONFIG.setSystemConf(configuration.systemConf)

    global._serviceName = _CONFIG.getServiceConf().name

    this.serviceRepository = new ServiceRepository()
  }

  /**
   * Stop XYZ system. will stop all ping and communication requests.
   * Should onle be used with tests.
   */
  terminate() {
    this.serviceRepository.terminate()
  }

  /**
   * Register a new function to be exported.
   * @param  {String}   serviceName       Unique name for this service.
   * @param  {Function} fn                Handler function for this service
   */
  register(serviceName, fn) {
    this.serviceRepository.register(serviceName, fn)
  }

  /**
   * Call a service by name in the entire system .
   * Note that this service will be searched over the entire system and the searching and choosing strategy can be over
   * written using Middleware
   * @param  {String} serviceName      Name of the sarvice to be called.
   * @param  {Object|String|Number} userPayload      Data to pass to receiver
   * @param  {Function} responseCallback Callback to manage the response
   */
  call(serviceName, userPayload, responseCallback) {
    this.serviceRepository.call(serviceName, userPayload, responseCallback)
  }

  /**
   * bootstrap function. the main goal is the lower the weight of the cunstroctor
   * Not implemented yet
   */
  bootstrap(configuration) {}

  /**
   * emit a message to all other services who listen on this event with .on()
   * Note that no callback should be provided. events are one way abstraction above
   * Calling.
   * Also, note that with call() the system will search first and then the request will be sent
   * to only one resulting system. emit will send a reqeust to all of the nodes and the receiving side
   * will decide whether to pass this event to the application or not.
   * @param  {String} eventName   name of the event. MUST start with ':'
   * @param  {Object|String|Number|Array} userPayload Data to be received by others.
   */
  emit(eventName, userPayload) {
    this.serviceRepository.emit(eventName, userPayload)
  }

  /**
   * subscribe to an event
   * [option] WILL USE .register for simplicity
   * @param  {String} eventName name of the event. MUST start with ':'
   * @param  {Function} handler   handler function when this event happens
   */
  subscribe(eventName, handler) {
    this.serviceRepository.subscribe(eventName, handler);
  }

  /**
   * Return an object of all middleware handlers available in the system. Each can be modified while
   * bootstraping or at runtime. See Middleware section for more details.
   * @return {Object} an Object of middleware handlers.
   */
  middlewares() {
    return {
      transport: {
        server: {
          callReceive: this.serviceRepository.getTransportLayer().Server.callReceiveMiddlewareStack
        },
        client: {
          callDispatch: this.serviceRepository.getTransportLayer().Client.callDispatchMidllewareStack
        }
      },
      serviceRepository: {
        callDispatch: this.serviceRepository.callDispatchMiddlewareStack
      }
    }
  }
}

module.exports = NodeXYZ
