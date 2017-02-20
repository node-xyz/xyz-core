let expect = require('chai').expect
let mockNode = require('./ms/mock.node').mockNode
let mockFunctions = require('./ms/mock.functions')
let mockSystem = require('./ms/mock.system')

exports.init = function () {
  var cwd, snd, rcv, system
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)
  system.addNode('localhost:3333')
  system.addNode('localhost:3334')
  snd = new mockNode('snd', 3334, cwd, system.getSystemConf())
  rcv = new mockNode('rcv', 3333, cwd, system.getSystemConf())

  console.log('sndConf', snd.conf, snd.xyz.CONFIG.getSelfConf())
  console.log('rcvConf', rcv.conf, rcv.xyz.CONFIG.getSelfConf())

  rcv.register('/mul', mockFunctions.mul)
  rcv.register('/up', mockFunctions.up)
  rcv.register('/rev', mockFunctions.rev)
  rcv.register('/neg', mockFunctions.neg)
  rcv.register('/finger', mockFunctions.finger)
  rcv.register('/blank', mockFunctions.blank)
  rcv.register('/none', mockFunctions.none)

  rcv.register('/math/mul', mockFunctions.mul)
  rcv.register('/math/add', mockFunctions.add)
  rcv.register('/math/neg', mockFunctions.neg)

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
exports.firstfind = require('./../../xyz.service.send.first.find')
exports.sendToAll = require('./../../xyz.service.send.to.all')
