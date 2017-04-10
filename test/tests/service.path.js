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
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system

  setTimeout(done, 1500)
})

it('path formating', function (done) {
  let test = 'a/b/'
  let test1 = '/a/b'
  let test3 = '/aaa123/123/abc/'
  let test4 = '//aa///////bb/'
  expect(Path.format(test)).to.equal('/a/b')
  expect(Path.format(test1)).to.equal(test1)
  expect(Path.format(test3)).to.equal(test3.slice(0, -1))
  expect(Path.format(test4)).to.equal('/aa/bb')

  done()
})

it('path validation', function (done) {
  let test = 'a/b/'
  let test1 = '/a/b'
  let test2 = '/'
  let test3 = '/aaa123/123/abc/'
  let test4 = '/asd//asd'
  let test5 = '/*'
  let test6 = '/**'
  let test7 = '/asd*'
  let test8 = '/abc/*/adc'
  expect(Path.validate(test)).to.equal(false)
  expect(Path.validate(test1)).to.equal(true)
  expect(Path.validate(test2)).to.equal(true)
  expect(Path.validate(test3)).to.equal(false)
  expect(Path.validate(test4)).to.equal(false)
  expect(Path.validate(test5)).to.equal(true)
  expect(Path.validate(test6)).to.equal(false)
  expect(Path.validate(test7)).to.equal(false)
  expect(Path.validate(test8)).to.equal(true)
  done()
})

it('adjunct to path tree', function (done) {
  let pt = new PathTree()
  let dummy = function () { console.log('dummy') }
  let s1 = pt.createPathSubtree('/math/add', dummy)
  // note that this will be fixed
  let s2 = pt.createPathSubtree('//math///neg', dummy)
  expect(s1 && s2).to.equal(true)
  done()
})

it('path mathcing', function (done) {
  let pt = new PathTree()

  let dummy = function () { console.log('dummy') }
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

it('path checking and status code in .register()', function (done) {
  let status = snd.xyz.register('/aa*')
  expect(status).to.equal(false)
  done()
})

it('path validation .call()', function (done) {
  snd.call({servicePath: '///ma*//mul', payload: {x: 2, y: 4}}, (err, body) => {
    expect(body).to.equal(null)
    expect(err.slice(0, 2)).to.equal('SR')
    done()
  })
})

it('path formating .call()', function (done) {
  // fix a message path
  function transportLayerServiceSpy (xSentMessage, next, end, xyz) {
    expect(xSentMessage.requestConfig.json.xyzPayload.service).to.equal('/math/mul')
    next()
  }

  snd.xyz.middlewares().transport.client('CALL').register(0, transportLayerServiceSpy)

  snd.call({servicePath: '///math//mul', payload: {x: 2, y: 4}}, (err, body) => {
    done()
  })

  // dont sent it if invalid
})

it.skip('path parent matching', function (done) {
  this.timeout(10 * 1000)
  let received = 0

  rcv.register('/', function slash () {
    console.log('/')
    received++
  })

  rcv.register('/test', function test () {
    console.log('/test')
    received++
  })

  rcv.register('/test/test1', function test1 (body, resp) {
    console.log('/test/test1')
    received++
    resp.jsonify('ok')
  })

  setTimeout(() => {
    snd.call({servicePath: '/test/test1'}, (err, body) => {
      console.log(err, body)
      console.log(received)
      done()
    })
  }, 3 * 1000)
})

after(function () {
  snd.stop()
  rcv.stop()
})
