const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let snd
let rcv
let system
let cwd
let str = 'manipulated'

before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  cwd = testSystem.cwd

  setTimeout(done, 500)
})

it('Add auth on the fly', function (done) {
  snd.middlewares().transport.client('CALL').register(0, require('xyz.transport.auth.basic.send'))
  rcv.middlewares().transport.server('CALL').register(0, require('xyz.transport.auth.basic.receive'))

  snd.call({servicePath: '/mul', payload: { x: 2, y: 10 }}, (err, body, response) => {
    expect(body).to.equal(20)
    done()
  })
})

it('wrong auth', function (done) {
  snd.middlewares().transport.client('CALL').remove(0)
  snd.middlewares().transport.client('CALL').register(0, (params, next, done) => {
    let requestConfig = params[0]
    requestConfig.json.auth = '123wrong'
    next()
  })

  snd.call({servicePath: '/mul', payload: { x: 2, y: 10 }}, (err, body, response) => {
    expect(body).to.equal(null)
    expect(typeof (err)).to.equal('object')
    done()
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
