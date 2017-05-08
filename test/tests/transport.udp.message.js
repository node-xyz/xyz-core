const common = require('../common')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions

let cwd, system, snd, rcv
before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  let _common = common.init()
  system = _common.system
  rcv = _common.rcv
  snd = _common.snd

  rcv.xyz.serviceRepository.registerServer('UDP', 2333, true)
  rcv.xyz.registerServerRoute(2333, 'udp')
  rcv.xyz.middlewares().transport.server('udp')(2333).register(0, common._udpMessageEvent)


  this.timeout(10 * 1000)
  setTimeout(done, 4000)
})

it('simple udp message', function (done) {
  // set up udp server in receiver
  snd.xyz.registerClientRoute('udp')
  snd.xyz.middlewares().transport.client('udp').register(0, common._udpExport)

  rcv.xyz.serviceRepository.once('message:receive', (data) => {
    done()
  })

  snd.call({
    servicePath: '/mul',
    payload: {x: 2, y: 3},
    route: 'udp',
    redirect: true
  }, (err1, body1, response1) => {
    expect(err1).to.equal(null)
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
