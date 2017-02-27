const fn = require('./../../test/ms/mock.functions')
const XYZ = require('./../../index')
const GenericMiddlewareHandler = require('./../../src/Middleware/generic.middleware.handler')

let stringMs = new XYZ({
  selfConf: {
    logLevel: 'verbose',
    name: 'stringMs',
    host: '127.0.0.1',
    transport: [{type: 'HTTP', port: 4000}]
  },
  systemConf: {
    nodes: ['127.0.0.1:5000']
  }
})

stringMs.register('/string/down', fn.down)
stringMs.register('/string/up', fn.up)
stringMs.register('/finger', fn.finger)

let udpMessageMiddleware = new GenericMiddlewareHandler(stringMs, 'UDPMessage', 'UDP')
udpMessageMiddleware.register(0, require('./../../src/Transport/Middlewares/call/udp.export.middleware'))
stringMs.registerClientRoute('UDP', udpMessageMiddleware)

setInterval(() => {
  stringMs.call({servicePath: '/math/decimal/*', payload: { x: 1000000, y: new Date().getTime() }}, (err, body, res) => {
    console.error('response of /math/decimal/* => ', err, body)
  })

  // note that the `.call` will always assume that the primary identifier of the
  //  destination (the first `transport` which is usually a http server) is the
  //  correct destination port. the redirect ley is required to fix this.
  // BUG: The biggest current issue with this is that we have to piggy back
  // aa description of the treansport servers in the ping message, which I think
  // won't be an issue since we will soon remove this idea entirely and the nodes
  // will not transmit all those data.
  stringMs.call({servicePath: '/math/decimal/sub', payload: {x: 10, y: 2}, route: 'UDP', redirect: true}, (err, body, res) => {
    console.error('response of /math/decimal/sub => ', err, body)
  })
}, 3000)

console.log(stringMs)
