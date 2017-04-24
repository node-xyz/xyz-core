let expect = require('chai').expect
let mockNode = require('./ms/mock.node').mockNode
let mockFunctions = require('./ms/mock.functions')
let mockSystem = require('./ms/mock.system')

exports.init = function () {
  var cwd, snd, rcv, system
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)
  system.addNode('127.0.0.1:3333')
  system.addNode('127.0.0.1:3334')
  snd = new mockNode('snd', 3334, cwd, system.getSystemConf())
  rcv = new mockNode('rcv', 3333, cwd, system.getSystemConf())

  rcv.register('/mul', mockFunctions.mul)
  rcv.register('/up', mockFunctions.up)
  rcv.register('/add', mockFunctions.add)
  rcv.register('/sub', mockFunctions.sub)
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
exports.firstfind = require('./../built/Service/Middleware/service.first.find')
exports.sendToAll = require('./../built/Service/Middleware/service.send.to.all')
exports.broadcastLocal = require('./../built/Service/Middleware/service.broadcast.local')
exports.broadcastGlobal = require('./../built/Service/Middleware/service.broadcast.global')
exports.sendToTarget = require('./../built/Service/Middleware/service.sent.to.target')
exports.Path = require('./../built/Service/path').Path
exports.PathTree = require('./../built/Service/path.tree').PathTree
exports._httpExport = require('./../built/Transport/Middlewares/http.export.middleware').default
exports._httpMessageEvent = require('./../built/Transport/Middlewares/http.receive.event').default
exports._udpExport = require('./../built/Transport/Middlewares/udp.export.middleware')._udpExport
exports._udpMessageEvent = require('./../built/Transport/Middlewares/udp.receive.event')._udpEvent
