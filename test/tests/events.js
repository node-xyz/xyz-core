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
let str = 'manipulated'

before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)
  system.addMicroservice({
    host: "http://localhost",
    port: 3333
  })
  system.addMicroservice({
    host: "http://localhost",
    port: 3334
  })

  // for (let i = 0 ; i < 10 ; i++) {
  //   system.addMicroservice({
  //     host: "http://localhost",
  //     port: 3335 + i
  //   })
  // }

  system.write()

  // for (let i = 0 ; i < 10 ; i++) {
  //   let mock = new mockMicroservice(`mock_${i}`, 3335 + i, cwd)
  //   mocks.push(mock)
  // }
  snd = new mockMicroservice('snd', 3334, cwd)
  rcv = new mockMicroservice('rcv', 3333, cwd)
  rcv.register('mul', mockFunctions.mul)
  rcv.register('up', mockFunctions.up)

  setTimeout(done, 500)
})


it('whassssaaaap', function (done) {
  snd.register(":hello", (payload, XResponse) => {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!")
    console.log(payload, XResponse)
    done()
  })

  rcv.emit(':hello', 'whassssaaaap')



})

after(function () {
  snd.stop()
  rcv.stop()
})
