let expect = require('chai').expect
let mockMicroservice = require('./ms/mock.microservice').MockMicroservice
let mockFunctions = require('./ms/mock.functions')
let mockSystem = require('./ms/mock.system')

exports.init = () => {
  let cwd, snd, rcv, system
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)
  system.addMicroservice({
    host: 'localhost',
    port: 3333
  })
  system.addMicroservice({
    host: 'localhost',
    port: 3334
  })
  system.write()
  snd = new mockMicroservice('snd', 3334, cwd)

  rcv = new mockMicroservice('rcv', 3333, cwd)
  rcv.register('/mul', mockFunctions.mul)
  rcv.register('/up', mockFunctions.up)
  rcv.register('/rev', mockFunctions.rev)
  rcv.register('/neg', mockFunctions.neg)
  rcv.register('/finger', mockFunctions.finger)

  return {
    snd: snd,
    rcv: rcv,
    system: system,
    cwd: cwd
  }
}
exports.expect = expect
exports.mockMicroService = mockMicroservice
exports.mockFunctions = mockFunctions
exports.mockSystem = mockSystem
exports.firstfind = require('./../../xyz-first-find/call.middleware.first.find')
exports.sendtoall = require('./../../xyz-send-to-all/call.send.to.all')
