const common = require('../common')
let expect = common.expect
let mockNode = common.mockNode
let mockFunctions = common.mockFunctions
let mockSystem = common.mockSystem

let cwd, system, snd, rcv
before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  cwd = testSystem.cwd

  rcv.xyz.serviceRepository.registerServer('UDP', 2333, true)
  rcv.xyz.registerServerRoute(2333, 'udp')
  rcv.xyz.middlewares().transport.server('udp')(2333).register(0, require('./../../src/Transport/Middlewares/call/udp.receive.event'))

  snd.xyz.registerClientRoute('udp')
  snd.xyz.middlewares().transport.client('udp').register(0, require('./../../src/Transport/Middlewares/call/udp.export.middleware'))

  setTimeout(done, 500)
})

it('service level http message send and receive', function (done) {
  let sent = false
  snd.xyz.serviceRepository.once('message:send', function (_data) {
    sent = true
  })
  rcv.xyz.serviceRepository.once('message:receive', function (data) {
    expect(data.userPayload.x).to.equal(2)
    expect(sent).to.equal(true)
    done()
  })
  snd.call({servicePath: '/mul', payload: {x: 2, y: 3}})
})

it('service level udp message send and receive', function (done) {
  let sent = false
  snd.xyz.serviceRepository.once('message:send', function (_data) {
    sent = true
  })
  rcv.xyz.serviceRepository.once('message:receive', function (data) {
    expect(data.userPayload.x).to.equal(2)
    expect(sent).to.equal(true)
    done()
  })
  snd.call({servicePath: '/none', payload: {x: 2, y: 3}, route: 'udp', redirect: true})
})

after(function () {
  snd.stop()
  rcv.stop()
})
