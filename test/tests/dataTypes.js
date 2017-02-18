const common = require('../common')
let expect = common.expect
let mockNode = common.mockNode
let mockFunctions = common.mockFunctions
let mockSystem = common.mockSystem

let cwd, system, snd, rcv
before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system

  setTimeout(done, 500)
})
it('bool', function (done) {
  snd.call({servicePath: '/neg', payload: false}, (err, body, response) => {
    expect(body).to.equal(true)
    done()
  })
})
it('nothing', function (done) {
  snd.call({servicePath: '/blank'}, (err, body, response) => {
    expect(body).to.equal('blank')
    done()
  })
})
it('obj', function (done) {
  snd.call({servicePath: '/finger', payload: {
    data: 'data'
  }}, (err, body, response) => {
    expect(body['test']).to.equal('test')
    done()
  })
})
it('arr', function (done) {
  snd.call({servicePath: '/rev', payload: [1, 2, 3]}, (err, body, response) => {
    expect(body).to.eql([3, 2, 1])
    done()
  })
})
after(function () {
  snd.stop()
  rcv.stop()
})
