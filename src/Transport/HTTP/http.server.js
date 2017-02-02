const http = require('http')
const url = require('url')
const EventEmitter = require('events')
const CONSTANTS = require('../../Config/Constants')
const logger = require('./../../Log/Logger')
const GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler')
const machineReport = require('./../../Util/machine.reporter')
const _CONFIGURATION = require('./../../Config/config.global')
let wrapper = require('./../../Util/Util').wrapper

class HTTPServer extends EventEmitter {
  constructor (xyz) {
    super()
    http.globalAgent.maxSockets = Infinity
    this.port = _CONFIGURATION.getSelfConf().port
    this.xyz = xyz

    // 3 default routes
    this.callReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'callReceiveMiddlewareStack')
    this.callReceiveMiddlewareStack.register(-1, require('./../Middlewares/call/call.receive.event.middleware'))

    this.pingReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'pingReceiveMiddlewareStack')
    this.pingReceiveMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.receive.event.middleware'))

    this.joinReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'joinReceiveMiddlewareStack')
    this.joinReceiveMiddlewareStack.register(-1, require('./../Middlewares/cluster/join.middleware.accept.all'))

    // user defined routes
    this.miscCalls = {}

    this.server = http.createServer()
      .listen(this.port, () => {
        logger.info(`Server listening on port : ${this.port}`)
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
          let self = this // TODO fix this
          if (parsedUrl.pathname === `/${CONSTANTS.url.CALL}`) {
            if (parsedUrl.query) {
              req.destroy()
            } else {
              this.callReceiveMiddlewareStack.apply([req, resp, JSON.parse(body)], 0, this.xyz)
            }
          } else if (parsedUrl.pathname === `/${CONSTANTS.url.JOIN}`) {
            if (_CONFIGURATION.getSelfConf().allowJoin) {
              this.joinReceiveMiddlewareStack.apply([req, resp, JSON.parse(body)], 0, this.xyz)
            } else { req.destroy() }
          } else if (parsedUrl.pathname === `/${CONSTANTS.url.PING}`) {
            this.pingReceiveMiddlewareStack.apply([req, resp, JSON.parse(body)], 0, this.xyz)
          } else {
            let dismissed = false
            for (let route in this.miscCalls) {
              if (parsedUrl.pathname === `/${route}`) {
                this.miscCalls[route].apply([req, resp, JSON.parse(body)], 0, this.xyz)
                dismissed = true
                break
              }
            }
            if (!dismissed) {
              req.destroy()
            }
          }
        })
      })
  }

  inspect () {
    let ret = `${wrapper('green', wrapper('bold', 'Middlewares'))}:
    ${this.callReceiveMiddlewareStack.inspect()}
    ${this.pingReceiveMiddlewareStack.inspect()}
    ${this.joinReceiveMiddlewareStack.inspect()}\n`

    for (let route in this.miscCalls) {
      ret += `    ${this.miscCalls[route].inspect()}\n`
    }
    return ret
  }

  inspectJSON () {
    return [
      this.callReceiveMiddlewareStack.inspectJSON(),
      this.pingReceiveMiddlewareStack.inspectJSON(),
      this.joinReceiveMiddlewareStack.inspectJSON()
    ].concat(Object.values(this.miscCalls))
  }

  close () {
    this.server.close()
  }

  validator (req, body) {
    if (req.method !== 'POST') {
      logger.warn(`a suspicous request was received.`)
      return false
    }
    if (body.length === 0) {
      logger.warn(`a suspicous request was received.`)
      return false
    }
    return true
  }

  // will initialize a new route with one default middleware
  // NOTE: this is experimental and there is no support to send sth directly to this
  // from whithin xyz. this is designed mostly for users outside of the system to have
  // a communication way
  registerCallRoute (prefix) {
    if (this.miscCalls[prefix]) {
      logger.warn(`call middleware with prefix ${prefix} already exists`)
      return -1
    }
    this.miscCalls[prefix] = new GenericMiddlewareHandler(this.xyz, `${prefix}MiddlewareHandler`)
    this.miscCalls[prefix].register(-1, require('./../Middlewares/call/call.receive.event.middleware'))
    logger.info(`new call route ${wrapper('bold', prefix)} added`)
    return 1
  }

}

module.exports = HTTPServer
