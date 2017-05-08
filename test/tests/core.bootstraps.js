const common = require('../common')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let cwd, system, snd, rcv
before(function (done) {
  this.timeout(10 * 1000)
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  setTimeout(done, 3 * 1000)
})

it('udp tunnel', function (done) {
  this.timeout(10 * 1000)
  rcv.xyz.bootstrap(require('./../../built/Bootstrap/udp.tunnel.bootstrap')._udpTunnel)
  setTimeout(() => {
    rcv.call({
      servicePath: '/mul',
      route: 'UDP_CALL',
      redirect: true,
      payload: {x: 2, y: 3}
    }, (err1, body1) => {
      console.log(1, err1, body1)
    })
  }, 5 * 1000)
  rcv.xyz.serviceRepository.on('message:receive', (data) => {
    done()
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
