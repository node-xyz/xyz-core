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

it('sending a basic message - call()', function (done) {
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

it('no Callback for sender message - default ', function (done) {
  snd.call({servicePath: 'mul', payload: {x: 2, y: 3}})
  rcv.xyz.serviceRepository.once('message:receive', (data) => {
    done()
  })
})

it('no callback for sender message - different send strategies', function (done) {
  let total = {snd: 0, rcv: 0}
  let _total = {snd: 0, rcv: 0}

  function check (data) {
    _total.rcv += 1
    if (_total.snd === total.snd && _total.rcv === total.rcv) {
      rcv.xyz.serviceRepository.removeListener('message:receive', check)
      done()
    }
  }

  snd.call({servicePath: 'add', payload: {x: 2, y: 3}, sendStrategy: common.firstFind})
  total.rcv += 1

  snd.call({servicePath: 'math/*', payload: {x: 2, y: 3}, sendStrategy: common.sendToAll})
  total.rcv += 3

  snd.call({servicePath: 'sub', payload: {x: 2, y: 3}, sendStrategy: common.broadcastLocal})
  total.rcv += 1

  snd.call({servicePath: 'neg', payload: 2, sendStrategy: common.broadcastGlobal})
  total.rcv += 1

  snd.call({servicePath: 'mul', payload: {x: 2, y: 3}, sendStrategy: common.sendToTarget('127.0.0.1:3333')})
  total.rcv += 1

  rcv.xyz.serviceRepository.on('message:receive', check)

  // TODO
  // snd.xyz.serviceRepository.on('message:receive', (data) => {
  //   console.log(total, _total)
  //   _total.rcv += 1
  //   if (_total.snd === total.snd && _total.rcv === total.rcv) {
  //     rcv.xyz.serviceRepository.removeListener('message:receive')
  //     snd.xyz.serviceRepository.removeListener('message:receive')
  //     done()
  //   }
  // })
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
