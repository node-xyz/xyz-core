let XYZ = require('./../../index')

let math = new XYZ({
  selfConf: {
    transport: [
      {type: 'HTTP', port: 4000},
      {type: 'UDP', port: 6000}
    ]
  }
})

// a function that need to be called securely and synchronously, with a callback
math.register('add', (payload, resp) => {
  resp.jsonify(payload.x + payload.y)
})

math.register('notification', (payload, resp) => {
  console.log(`recevier ${payload} [resp ${resp}]`)
})

// sender side. we need a udp route
math.registerClientRoute('UDP_BCAST')

const _udpExport = require('./../../src/Transport/Middlewares/call/udp.export.middleware')
math.middlewares().transport.client('UDP_BCAST').register(0, _udpExport)

// receiving side
// need a UDP server with the same route name
math.registerServerRoute(6000, 'UDP_BCAST')

const _udpMessageEvent = require('./../../src/Transport/Middlewares/call/udp.receive.event')
math.middlewares().transport.server('UDP_BCAST')(6000).register(0, _udpMessageEvent)

// default call
setTimeout(() => {
  math.call({
    servicePath: 'add',
    payload: {x: 1, y: 7}
  }, (err, body) => {
    console.log(`add => ${err}, ${body}`)
  })
}, 5000)

// broadcast call
// will use a new send strategy and udp
const _broadcastGlobal = require('./../../src/Service/Middleware/service.broadcast.global')
setInterval(() => {
  math.call({
    servicePath: 'notification',
    payload: 'STH HAPPENED!',
    sendStrategy: _broadcastGlobal,
    route: 'UDP_BCAST',
    redirect: true
  }, (err, msg) => {
    console.log('sender', err, msg)
  })
}, 1000)

console.log(math)
