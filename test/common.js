let expect = require('chai').expect
let mockNode = require('./ms/mock.node').mockNode
let mockFunctions = require('./ms/mock.functions')
let mockSystem = require('./ms/mock.system')

exports.init = () => {
  let cwd, snd, rcv, system
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)
  system.addNode('localhost:3333')
  system.addNode('localhost:3334')
  snd = new mockNode('snd', 3334, cwd, system.getSystemConf())
  rcv = new mockNode('rcv', 3333, cwd, system.getSystemConf())
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
exports.mockNode = mockNode
exports.mockFunctions = mockFunctions
exports.mockSystem = mockSystem
exports.firstfind = require('xyz.service.send.first.find')
exports.sendtoall = require('xyz.service.send.to.all')
