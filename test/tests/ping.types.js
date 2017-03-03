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

it.skip('initial state', function (done) {

})

it.skip('add node on the fly - using seed node', function (done) {

})

it.skip('remove on the fly', function (done) {

})

after(function () {
  snd.stop()
  rcv.stop()
})
