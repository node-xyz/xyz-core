let XYZ = require('./../../index')
let _httpExport = require('./../../src/Transport/Middlewares/call/http.export.middleware')
let math = new XYZ({})

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

// call it. note that we must wait a sec since service discovery must resolve local node
setTimeout(() => {
  math.call({servicePath: 'add', payload: {x: 1, y: 7}, route: 'SECRET'}, (err, body) => {
    console.log(err, body)
  })
}, 1000)

console.log(math)
