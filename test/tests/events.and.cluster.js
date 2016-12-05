const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockMicroservice = common.mockMicroService
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let cwd, system, snd, rcv
let mocks = []
let mocks_count = 2
before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)

  // the system is consisted of snd and rcv only
  system.addMicroservice('localhost:3333')
  system.addMicroservice('localhost:3334')

  snd = new mockMicroservice('snd', 3334, cwd, system.getSystemConf())
  rcv = new mockMicroservice('rcv', 3333, cwd, system.getSystemConf())
  rcv.register('mul', mockFunctions.mul)
  rcv.register('up', mockFunctions.up)

  for (let i = 0; i < mocks_count; i++) {
    let mock = new mockMicroservice(`mock_${i}`, 3335 + i, cwd, system.getSystemConf())
    mocks.push(mock)
  }

  setTimeout(done, 500)
})

it('is anybody there ?', function (done) {
  setTimeout(() => {
    expect(Object.keys(snd.xyz.serviceRepository.foreignNodes).length).to.equal(mocks_count + 2)
    expect(Object.keys(rcv.xyz.serviceRepository.foreignNodes).length).to.equal(mocks_count + 2)
    for ( let i = 0; i < mocks_count; i++) {
      expect(Object.keys(mocks[i].xyz.serviceRepository.foreignNodes).length).to.equal(mocks_count + 2)
    }
    done()
  }, 1000)
  this.timeout(10000)
})

it('what goes up must come down ?', function (done) {
  mocks[0].stop()
  mocks[1].stop()

  setTimeout(() => {
    console.log(snd.xyz.serviceRepository)
    expect(Object.keys(snd.xyz.serviceRepository.foreignNodes).length).to.equal(mocks_count)
    expect(Object.keys(rcv.xyz.serviceRepository.foreignNodes).length).to.equal(mocks_count)
    done()
  }, 10000)
  this.timeout(200000)
})

after(function () {
  snd.stop()
  rcv.stop()
})
