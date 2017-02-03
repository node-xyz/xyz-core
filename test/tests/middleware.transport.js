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
  rcv.middlewares().transport.server('CALL').register(0, manipulatorMiddleware)

  snd.call({servicePath: 'up', payload: 'hello'}, (err, body, response) => {
    expect(body).to.equal(str.toUpperCase())
    rcv.middlewares().transport.server('CALL').remove(0)
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

  rcv.middlewares().transport.server('CALL').register(0, earlyResponseMiddleware)

  snd.call({servicePath: 'up', payload: 'hello'}, (err, body, response) => {
    expect(body).to.equal('This is early temination. note that this must be a json and then stringified')
    rcv.middlewares().transport.server('CALL').remove(0)
    done()
  })
})

it('early termination', function (done) {
  function terminatorMiddleware (params, next, end) {
    params[0].destroy()
    end()
  }

  rcv.middlewares().transport.server('CALL').register(0, terminatorMiddleware)

  snd.call({servicePath: 'up', payload: 'hello'}, (err, body, response) => {
    expect(body).to.equal(null)
    expect(response).to.equal(null)
    rcv.middlewares().transport.server('CALL').remove(0)
    done()
  })
})

it('misc routes', function (done) {
  function earlyResponseMiddleware (params, next, end) {
    params[1].end(JSON.stringify({userPayload: 'This is early temination. note that this must be a json and then stringified'}))
    end()
  }

  rcv.xyz.registerServerRoute('testRoute')
  snd.xyz.registerClientRoute('testRoute')
  rcv.xyz.middlewares().transport.server('testRoute').register(0, earlyResponseMiddleware)

  snd.call({servicePath: 'up', payload: 'hello', route: 'testRoute'}, (err, body, response) => {
    expect(body).to.equal('This is early temination. note that this must be a json and then stringified')

    // TODO this must work in the future ... 
    snd.call({servicePath: 'does not matter', payload: 'does not matter', route: 'PING'}, (err, body, response) => {
      console.log(2, err, body)
      done()
    })
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
