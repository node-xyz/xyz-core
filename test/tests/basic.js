const common = require('../common')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let cwd, system, snd, rcv
before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  setTimeout(done, 1000)
})

it('hello world', function (done) {
  console.log(snd)
  console.log(rcv)
  snd.call({
    servicePath: '/mul',
    payload: {x: 2, y: 3}
  }, (err1, body1, response1) => {
    expect(body1).to.equal(6)
    expect(err1).to.equal(null)
    expect(response1.statusCode).to.equal(200)
    snd.call({servicePath: '/up', payload: 'hello'}, (err2, body2, response2) => {
      expect(body2).to.equal('HELLO')
      expect(err2).to.equal(null)
      expect(response2.statusCode).to.equal(200)
      done()
    })
  })
})

it('local not found', function (done) {
  snd.call({servicePath: '/mullll', payload: {
    x: 2,
    y: 3
  }}, (err, body, resp) => {
    expect(body).to.equal(null)
    expect(err).to.equal(http.STATUS_CODES[404])
    done()
  })
})

it('no Callback for sender call', function (done) {
  snd.call({servicePath: 'mul', payload: {x: 2, y: 3}})
  rcv.xyz.serviceRepository.once('message:receive', (data) => {
    console.log(data)
    done()
  })
})

it('HTTP statusCode', function (done) {
  snd.call({
    servicePath: '/blank',
    payload: 'whatever'
  }, (err, body, response) => {
    expect(response.statusCode).to.equal(201)
    done()
  })
})

it('a warning to all about paths', function (done) {
  rcv.register('/math/decimal/mul', mockFunctions.mul)

  snd.call({servicePath: '/mul', payload: {x: 2, y: 3}}, (err, body, response) => {
    expect(body).to.equal(6)
    snd.call({servicePath: '/math/decimal'}, (err, body) => {
      expect(err).to.equal('Not Found')
      done()
    })
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
