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

    this.callReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'callReceiveMiddlewareStack')
    this.callReceiveMiddlewareStack.register(-1, require('./../Middlewares/call/call.receive.event.middleware'))

    this.pingReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'pingReceiveMiddlewareStack')
    this.pingReceiveMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.receive.event.middleware'))

    this.joinReceiveMiddlewareStack = new GenericMiddlewareHandler(xyz, 'joinReceiveMiddlewareStack')
    this.joinReceiveMiddlewareStack.register(-1, require('./../Middlewares/cluster/join.middleware.accept.all'))

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
          if (! this.validator(req, body)) {
            req.destroy()
            return
          }

          let parsedUrl = url.parse(req.url)
          let self = this // TODO fix this
          if (parsedUrl.pathname === `/${CONSTANTS.url.CALL}`) {
            if (parsedUrl.query) {
              req.destroy()
            } else {
              this.callReceiveMiddlewareStack.apply([req, resp, JSON.parse(body), self], 0)
            }
          } else if (parsedUrl.pathname === `/${CONSTANTS.url.JOIN}`) {
            if (_CONFIGURATION.getSelfConf().allowJoin) {
              this.joinReceiveMiddlewareStack.apply([req, resp, JSON.parse(body), self], 0)
            }else { req.destroy() }
          }
          else if (parsedUrl.pathname === `/${CONSTANTS.url.PING}`) {
            this.pingReceiveMiddlewareStack.apply([req, resp, JSON.parse(body), self], 0)
          } else {
            req.destroy()
          }
        })
    })
  }

  _inspect () {
    return `${wrapper('green', wrapper('bold', 'Middlewares'))}:
  ${this.callReceiveMiddlewareStack._inspect()}
  ${this.pingReceiveMiddlewareStack._inspect()}
  ${this.joinReceiveMiddlewareStack._inspect()}
  `
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

}

module.exports = HTTPServer
