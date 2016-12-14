const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let cwd, system, snd, rcv
let str = 'manipulated'

before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  cwd = testSystem.cwd

  setTimeout(done, 500)
})

it('manipulator', function (done) {
  function manipulatorMiddleware (params, next, end) {
    params[2].userPayload = str
    next()
  }
  rcv.middlewares().transport.callReceive.register(0, manipulatorMiddleware)

  snd.call('up', 'hello', (err, body, response) => {
    expect(body).to.equal(str.toUpperCase())
    rcv.middlewares().transport.callReceive.remove(0)
    done()
  })
})

it('early response', function (done) {
  function earlyResponseMiddleware (params, next, end) {
    // Well, ... this is not that good!
    // THIS is beacuse we are forcing a JSON.parse() even on each response ?
    params[1].end(JSON.stringify({userPayload: 'This is early temination. note that this must be a json and then stringified'}))
    end()
  }

  rcv.middlewares().transport.callReceive.register(0, earlyResponseMiddleware)

  snd.call('up', 'hello', (err, body, response) => {
    expect(body).to.equal('This is early temination. note that this must be a json and then stringified')
    rcv.middlewares().transport.callReceive.remove(0)
    done()
  })
})

it('early termination', function (done) {
  function terminatorMiddleware (params, next, end) {
    params[0].destroy()
    end()
  }

  rcv.middlewares().transport.callReceive.register(0, terminatorMiddleware)

  snd.call('up', 'hello', (err, body, response) => {
    expect(body).to.equal(null)
    expect(response).to.equal(null)
    rcv.middlewares().transport.callReceive.remove(0)
    done()
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
