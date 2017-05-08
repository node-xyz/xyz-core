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

  snd.xyz.registerClientRoute('foo')
  snd.xyz.middlewares().transport.client('foo').register(0, common._httpExport)

  // default port
  rcv.xyz.registerServerRoute(rcv.xyz.id().port, 'foo')
  rcv.xyz.middlewares().transport.server('foo')(rcv.xyz.id().port).register(0, common._httpMessageEvent)


  this.timeout(10 * 1000)
  setTimeout(done, 4000)
})

it('multiple routes', function (done) {
  snd.call({servicePath: '/mul', route: 'foo', payload: {x: 2, y: 3}}, (err, body) => {
    expect(body).to.equal(6)
    done()
  })
})

it('add routes on the fly', function (done) {
  snd.xyz.registerClientRoute('bar')
  snd.xyz.middlewares().transport.client('bar').register(0, common._httpExport)

  // default port
  rcv.xyz.registerServerRoute(rcv.xyz.id().port, 'bar')
  rcv.xyz.middlewares().transport.server('bar')(rcv.xyz.id().port).register(0, common._httpMessageEvent)

  snd.call({servicePath: '/mul', route: 'bar', payload: {x: 2, y: 3}}, (err, body) => {
    expect(body).to.equal(6)
    done()
  })
})
after(function () {
  snd.stop()
  rcv.stop()
})
