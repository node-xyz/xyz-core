const common = require('../common')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions

let cwd, system, snd, rcv
before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  cwd = testSystem.cwd
  setTimeout(done, 1000)
})

it('inspect', function (done) {
  expect(snd.xyz.inspect().length).to.be.at.least(1000)
  done()
})

it('inspectJSON', function (done) {
  let sndj = snd.xyz.inspectJSON()
  let rcvj = rcv.xyz.inspectJSON()

  expect(sndj.ServiceRepository.services.length).to.equal(0)
  expect(rcvj.ServiceRepository.services.length).to.equal(10)

  expect(rcvj.Transport.outgoingRoutes.length).to.equal(2)
  expect(sndj.Transport.outgoingRoutes.length).to.equal(2)

  expect(rcvj.Transport.servers.length).to.equal(1)
  expect(sndj.Transport.servers.length).to.equal(1)

  expect(rcvj.Transport.servers[0].length).to.equal(2)
  expect(sndj.Transport.servers[0].length).to.equal(2)

  done()
})

after(function () {
  snd.stop()
  rcv.stop()
})
