const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let cwd, system, snd, rcv
let mocks = []
let mocks_count = 3
before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)

  // the system is consisted of snd and rcv only
  system.addNode('localhost:3333')
  system.addNode('localhost:3334')

  snd = new mockNode('snd', 3334, cwd, system.getSystemConf())
  rcv = new mockNode('rcv', 3333, cwd, system.getSystemConf())
  rcv.register('mul', mockFunctions.mul)
  rcv.register('up', mockFunctions.up)

  for (let i = 0; i < mocks_count; i++) {
    let mock = new mockNode(`mock_${i}`, 3335 + i, cwd, system.getSystemConf())
    mocks.push(mock)
  }

  setTimeout(done, 500)
})

it('is anybody there ?', function (done) {
  setTimeout(() => {
    expect(snd.xyz.CONFIG.getSystemConf().nodes.length).to.equal(mocks_count + 2)
    expect(rcv.xyz.CONFIG.getSystemConf().nodes.length).to.equal(mocks_count + 2)
    for (let i = 0; i < mocks_count; i++) {
      expect(Object.keys(mocks[i].xyz.serviceRepository.foreignNodes).length).to.equal(mocks_count + 2)
    }
    done()
  }, 5000)
  this.timeout(10000)
})

it('what goes up must come down ?', function (done) {
  mocks[0].stop()
  mocks[1].stop()
  mocks[2].stop()

  setTimeout(() => {
    expect(snd.xyz.CONFIG.getSystemConf().nodes.length).to.equal(mocks_count + 2 - 3)
    expect(rcv.xyz.CONFIG.getSystemConf().nodes.length).to.equal(mocks_count + 2 - 3)
    done()
  }, 15000)
  this.timeout(200000)
})

after(function () {
  snd.stop()
  rcv.stop()
})
