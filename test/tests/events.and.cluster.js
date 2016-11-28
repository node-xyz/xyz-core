const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockMicroservice = common.mockMicroService
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let snd
let rcv
let mocks = []
let system
let cwd

before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)

  // the system is consisted of snd and rcv only
  system.addMicroservice('localhost:3333')
  system.addMicroservice('localhost:3334')
  system.write()

  snd = new mockMicroservice('snd', 3334, cwd)
  rcv = new mockMicroservice('rcv', 3333, cwd)
  rcv.register('mul', mockFunctions.mul)
  rcv.register('up', mockFunctions.up)

  for (let i = 0; i < 10; i++) {
    let mock = new mockMicroservice(`mock_${i}`, 3335 + i, cwd)
    mocks.push(mock)
  }

  setTimeout(done, 500)
})

it('is anybody there ?', function (done) {
  setTimeout(() => {
    expect(Object.keys(snd.xyz.serviceRepository.foreignNodes).length).to.equal(12)
    expect(Object.keys(rcv.xyz.serviceRepository.foreignNodes).length).to.equal(12)
    for ( let i = 0; i < 10; i++) {
      expect(Object.keys(mocks[i].xyz.serviceRepository.foreignNodes).length).to.equal(12)
    }
    done()
  }, 1000)
  this.timeout(5000)
})
after(function () {
  snd.stop()
  rcv.stop()
})
