var Path = require('./../../src/Service/path')
const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const PathTree = require('./../../src/Service/path.tree')

let cwd, system, snd, rcv
before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)
  system.addNode('localhost:3333')
  system.addNode('localhost:3334')
  snd = new mockNode('snd', 3334, cwd, system.getSystemConf())
  rcv = new mockNode('rcv', 3333, cwd, system.getSystemConf())

  rcv.register('/math/decimal/mul', mockFunctions.mul)
  rcv.register('/math/decimal/add', mockFunctions.add)
  rcv.register('/math/decimal/sub', mockFunctions.sub)
  rcv.register('/math/decimal', mockFunctions.finger)

  setTimeout(done, 500)
})

it('path formating', function (done) {
  let test = 'a/b/'
  let test1 = '/a/b'
  let test3 = '/aaa123/123/abc/'
  expect(Path.format(test)).to.equal('/a/b')
  expect(Path.format(test1)).to.equal(test1)
  expect(Path.format(test3)).to.equal(test3.slice(0, -1))
  done()
})

it('path validation', function (done) {
  let test = 'a/b/'
  let test1 = '/a/b'
  let test2 = '/'
  let test3 = '/aaa123/123/abc/'
  let test4 = '/asd//asd'
  expect(Path.validate(test)).to.equal(false)
  expect(Path.validate(test1)).to.equal(true)
  expect(Path.validate(test2)).to.equal(true)
  expect(Path.validate(test3)).to.equal(false)
  expect(Path.validate(test4)).to.equal(false)
  done()
})

it('adjunct to path tree', function (done) {
  let pt = new PathTree()
  let dummy = function () { console.log('dummy')}
  pt.createPathSubtree('/math/add', dummy)
  done()
})

it('path mathcing' , function (done) {
  let pt = new PathTree()

  let dummy = function () { console.log('dummy')}
  pt.createPathSubtree('/math/add/decimal', dummy)
  pt.createPathSubtree('/math/add/float', dummy)
  pt.createPathSubtree('/math/sub/decimal', dummy)
  pt.createPathSubtree('/math/sub/float', dummy)
  pt.createPathSubtree('/foo/bar/buzz/duck/go', dummy)
  pt.createPathSubtree('/foo/bar1/buzz1/duck/go', dummy)
  pt.createPathSubtree('/foo/bar1/buzz1/duck/g1', dummy)

  expect(Path.match('/math/add/float', pt.serializedTree).length).to.equal(1)
  expect(Path.match('/math/add/wrong', pt.serializedTree).length).to.equal(0)
  expect(Path.match('/math/add/decimal/extra', pt.serializedTree).length).to.equal(0)
  expect(Path.match('/math', pt.serializedTree).length).to.equal(1)
  expect(Path.match('/math/add/*', pt.serializedTree).length).to.equal(2)
  expect(Path.match('/math/*', pt.serializedTree).length).to.equal(2)
  expect(Path.match('/foo/*/*/duck/go', pt.serializedTree).length).to.equal(2)
  expect(Path.match('/foo/*/*/duck/*', pt.serializedTree).length).to.equal(3)

  done()
})

it('first find scenarios', function (done) {
  snd.call({servicePath: '/math/decimal/mul', payload: {x: 2, y: 3}} , (err, body, response) => {
    expect(body).to.equal(6)
    snd.call({servicePath: '/math/mul'} , (err, body) => {
      expect(err).to.equal('Not Found')
      done()
    })
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
