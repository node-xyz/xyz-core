const common = require('../common')
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


  this.timeout(10 * 1000)
  setTimeout(done, 3000)
})

it('manipulator', function (done) {
  function manipulatorMiddleware (xMessage, next, end) {
    xMessage.message.userPayload = str
    next()
  }
  rcv.middlewares().transport.server('CALL')(rcv.xyz.id().port).register(0, manipulatorMiddleware)

  snd.call({servicePath: 'up', payload: 'hello'}, (err, body, response) => {
    expect(body).to.equal(str.toUpperCase())
    rcv.middlewares().transport.server('CALL')(rcv.xyz.id().port).remove(0)
    done()
  })
})

it('early response', function (done) {
  function earlyResponseMiddleware (xReceivedMessage, next, end) {
    xReceivedMessage.response.end(JSON.stringify('This is early temination. note that this must be a json and then stringified'))
    end()
  }

  rcv.middlewares().transport.server('CALL')(rcv.xyz.id().port).register(0, earlyResponseMiddleware)

  snd.call({servicePath: 'up', payload: 'hello'}, (err, body, response) => {
    expect(body).to.equal('This is early temination. note that this must be a json and then stringified')
    rcv.middlewares().transport.server('CALL')(rcv.xyz.id().port).remove(0)
    done()
  })
})

it('early termination', function (done) {
  function terminatorMiddleware (xReceivedMessage, next, end) {
    xReceivedMessage.response.destroy()
    end()
  }

  rcv.middlewares().transport.server('CALL')(rcv.xyz.id().port).register(0, terminatorMiddleware)

  snd.call({servicePath: 'up', payload: 'hello'}, (err, body, response) => {
    expect(body).to.equal(null)
    expect(response).to.equal(null)
    rcv.middlewares().transport.server('CALL')(rcv.xyz.id().port).remove(0)
    done()
  })
})

it('misc routes', function (done) {
  function earlyResponseMiddleware (xReceivedMessage, next, end) {
    xReceivedMessage.response.end(JSON.stringify('This is early temination. note that this must be a json and then stringified'))
    end()
  }

  rcv.xyz.registerServerRoute(rcv.xyz.id().port, 'testRoute')
  snd.xyz.registerClientRoute('testRoute')

  snd.middlewares().transport.client('testRoute').register(0, common._httpExport)
  rcv.middlewares().transport.server('testRoute')(rcv.xyz.id().port).register(0, earlyResponseMiddleware)

  snd.call({servicePath: 'up', payload: 'hello', route: 'testRoute'}, (err, body, response) => {
    expect(body).to.equal('This is early temination. note that this must be a json and then stringified')

    // note taht servicePath must be simething valid so the service discovery
    // will not fail
    snd.call({servicePath: 'up', payload: 'does not matter', route: 'PING'}, (err, body, response) => {
      expect(err).to.equal(null)
      expect(typeof (body)).to.equal('object')
      expect(Object.keys(body).indexOf('services')).to.be.above(-1)
      done()
    })
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
