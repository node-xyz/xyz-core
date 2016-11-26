const http = require('http')
const url = require('url')
const EventEmitter = require('events')
const CONSTANTS = require('../../Config/Constants')
const logger = require('./../../Log/Logger')
const GenericMiddlewareHandler = require('./../../Middleware/generic.middleware.handler')
const machineReport = require('./../../Util/machine.reporter')
const _CONFIGURATION = require('./../../Config/config.global')

class HTTPServer extends EventEmitter {
  constructor () {
    super()
    http.globalAgent.maxSockets = Infinity
    this.port = _CONFIGURATION.getSelfConf().port

    this.callReceiveMiddlewareStack = new GenericMiddlewareHandler()
    // this.callReceiveMiddlewareStack.register(-1, require('xyz.transport.global.receive.logger'))
    this.callReceiveMiddlewareStack.register(-1, require('./../Middlewares/call/call.receive.event.middleware'))

    this.pingReceiveMiddlewareStack = new GenericMiddlewareHandler()
    // this.pingReceiveMiddlewareStack.register(-1, require('xyz.transport.global.receive.logger'))
    // this.pingReceiveMiddlewareStack.register(-1, require('xyz.transport.auth.basic.receive'))
    this.pingReceiveMiddlewareStack.register(-1, require('./../Middlewares/ping/ping.receive.event.middleware'))

    this.joinReceiveMiddlewareStack = new GenericMiddlewareHandler()
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

  close () {
    this.server.close()
  }
}

module.exports = HTTPServer
