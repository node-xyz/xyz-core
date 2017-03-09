const http = require('http')
const url = require('url')
const EventEmitter = require('events')
const XResponse = require('./../XResponse')
const logger = require('./../../Log/Logger')
const GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler')
const CONFIG = require('./../../Config/config.global')
let wrapper = require('./../../Util/Util').wrapper

/**
* This class will call its `call.receive.mw` with the following values in `param`:
*  [req, resp, JSON.parse(body), this.port]
*  - **req**: the request object
*  - **resp**: the response object
*  - **body** parsed body. also available in req object
*  - **port**: port of this server
 */
class HTTPServer extends EventEmitter {

  /**
   * Creates a new HTTP server
   * @param xyz {Object} a reference to the curretn xyz object. will be filled automatically.
   * @param port {String|Number} The main port of this server.
   */
  constructor (xyz, port) {
    super()
    http.globalAgent.maxSockets = Infinity
    this.port = port || CONFIG.getSelfConf().port
    this.xyz = xyz

    this.routes = {}

    let callReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'call.receive.mw', 'CALL')
    callReceiveMiddlewareStack.register(-1, require('./../Middlewares/call/http.receive.event'))
    this.registerRoute('CALL', callReceiveMiddlewareStack)

    this.server = http.createServer()
      .listen(this.port, () => {
        logger.info(`HTTP Server listening on port : ${this.port}`)
      }).on('request', (req, resp) => {
        var body = []
        req
        .on('data', (chuck) => {
          body.push(chuck)
        })
        .on('end', () => {
          if (!this.validator(req, body)) {
            req.destroy()
            return
          }
          let parsedUrl = url.parse(req.url)
          let dismissed = false
          for (let route in this.routes) {
            if (parsedUrl.pathname === `/${route}`) {
              // wrap response
              XResponse(resp)
              this.routes[route].apply([req, resp, JSON.parse(body), this.port], 0)
              dismissed = true
              break
            }
          }
          if (!dismissed) {
            req.destroy()
          }
        })
      })
  }

  inspect () {
    let ret = `${wrapper('green', wrapper('bold', 'Middlewares'))}:\n`

    for (let route in this.routes) {
      ret += `    ${this.routes[route].inspect()}\n`
    }
    return ret
  }

  inspectJSON () {
    let ret = []
    for (let route in this.routes) ret.push(this.routes[route].inspectJSON())
    return ret
  }

  close () {
    this.server.close()
  }

  validator (req, body) {
    if (req.method !== 'POST') {
      logger.warn('a suspicous message was received.')
      return false
    }
    if (body.length === 0) {
      logger.warn('a suspicous message was received.')
      return false
    }
    return true
  }

  // will initialize a new route with one default middleware
  // NOTE: this is experimental and there is no support to send sth directly to this
  // from whithin xyz. this is designed mostly for users outside of the system to have
  // a communication way
  registerRoute (prefix, gmwh) {
    if (this.routes[prefix]) {
      logger.warn(`message middleware with prefix ${prefix} already exists`)
      return -1
    } else {
      gmwh = gmwh || new GenericMiddlewareHandler(this.xyz, `${prefix}-MiddlewareHandler`, prefix)
      this.routes[prefix] = gmwh
      logger.info(`HTTP Server:: new message route ${wrapper('bold', prefix)} added`)
      return 1
    }
  }

}

module.exports = HTTPServer
