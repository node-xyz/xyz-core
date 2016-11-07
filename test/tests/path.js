var Path = require('./../../src/Service/path')
const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockMicroservice = common.mockMicroService
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const PathTree = require('./../../src/Service/path.tree')

before(function (done) {
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
  pt = new PathTree()
  let dummy = function () { console.log('dummy')}
  pt.createPathSubtree('/math/add/decimal', dummy)
  pt.createPathSubtree('/math/add/float', dummy)
  pt.createPathSubtree('/math/sub/decimal', dummy)
  pt.createPathSubtree('/math/sub/float', dummy)
  pt.createPathSubtree('/foo/bar/buzz/duck/go', dummy)
  pt.createPathSubtree('/foo/bar1/buzz1/duck/go', dummy)
  pt.createPathSubtree('/foo/bar1/buzz1/duck/g1', dummy)

  console.log(pt.getMatches('/math/add/float'))
  console.log(pt.getMatches('/foo/*/*/duck/go'))
  console.log(pt.getMatches('/math/add/*'))
  console.log(pt.getMatches('/math/*'))
  console.log(pt.getMatches('/math'))
  console.log(pt.getMatches('/math/add/wrong'))
  console.log(pt.getMatches('/math/add/decimal/extra'))
  console.log(pt.getMatches('/foo/*/*/duck/go'))
  done()
})

it('first find scenarios', function (done) {
  snd.call('/math/decimal/mul', {x: 2, y: 3} , (err, body, response) => {
    expect(body).to.equal(6)
    snd.call('/math/mul', {} , (err, body) => {
      expect(err).to.equal('Not Found')
      done()
    })
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
