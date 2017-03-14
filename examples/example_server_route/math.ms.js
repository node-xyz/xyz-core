let XYZ = require('./../../index')
let _httpExport = require('./../../src/Transport/Middlewares/call/http.export.middleware')
let _httpMessageEvent = require('./../../src/Transport/Middlewares/call/http.receive.event')
let math = new XYZ({
  selfConf: {
    transport: [
      {type: 'HTTP', port: 4000},
      {type: 'HTTP', port: 5000},
      {type: 'UDP', port: 6000}
    ]
  }
})

// console.log(math)

// console.log(math.id())

function _msgConfigLogger (params, next, end, xyz) {
  console.log(`CONFIG LOGGER :: ${JSON.stringify(params[0], 2)}`)
  next()
}

// register a dummy service
math.register('add', (payload, resp) => {
  resp.jsonify(payload.x + payload.y)
})

math.registerClientRoute('SECRET')
math.middlewares().transport.client('SECRET').register(0, _msgConfigLogger)
math.middlewares().transport.client('SECRET').register(-1, _httpExport)

// insert _msgConfigLogger into the /CALL route
math.middlewares().transport.client('CALL').register(0, _msgConfigLogger)

// register a new server route
math.registerServerRoute(4000, 'SECRET')
math.middlewares().transport.server('SECRET')(4000).register(0, _httpMessageEvent)

// add a new server
math.registerServer('UDP', 7000)
math.registerServer('HTTP', 8000)

// call it. note that we must wait a sec since service discovery must resolve local node

setTimeout(() => {
  math.call({servicePath: 'add', payload: {x: 1, y: 7}, route: 'SECRET'}, (err, body) => {
    console.log(err, body)
  })
}, 1000)

console.log(math)
