const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockMicroservice = common.mockMicroService
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let snd
let rcv
let system
let cwd
let str = 'manipulated'

before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)
  system.addMicroservice({
    host: "http://localhost",
    port: 3333
  })
  system.addMicroservice({
    host: "http://localhost",
    port: 3334
  })
  system.write()
  snd = new mockMicroservice('snd', 3334, cwd)
  rcv = new mockMicroservice('rcv', 3333, cwd)
  rcv.register('mul', mockFunctions.mul)
  rcv.register('up', mockFunctions.up)

  setTimeout(done, 500)
})


it('Add auth on the fly', function (done) {
  snd.middlewares().transport.client.callDispatch.register(1, require('./../../src/Transport/Middlewares/global.dispatch.auth.basic.middleware'))
  rcv.middlewares().transport.server.callReceive.register(1, require('./../../src/Transport/Middlewares/global.receive.auth.basic.middleware'))

  snd.call('mul', { x: 2, y: 10 }, (err, response, body) => {
    expect(body).to.equal(20)
    done()
  })
})

it('wrong auth', function (done) {
  snd.middlewares().transport.client.callDispatch.register(1, (params, next, done) => {
    let requestConfig = params[0]
    requestConfig.json.auth = "123wrong"
    next()
  })
  rcv.middlewares().transport.server.callReceive.register(1, require('./../../src/Transport/Middlewares/global.receive.auth.basic.middleware'))

  snd.call('mul', { x: 2, y: 10 }, (err, response, body) => {
    expect(body).to.equal(undefined)
    done()
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
