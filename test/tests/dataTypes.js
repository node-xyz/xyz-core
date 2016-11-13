const common = require('../common')
let expect = common.expect
let mockMicroservice = common.mockMicroService
let mockFunctions = common.mockFunctions
let mockSystem = common.mockSystem

var snd
var rcv
before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  cwd = testSystem.cwd

  setTimeout(done, 500)
})
it('bool', function (done) {
  snd.call('/neg', false, (err, body, response) => {
    expect(body).to.equal(true)
    done()
  })
})
it('obj', function (done) {
  snd.call('/finger', {
    data: 'data'
  }, (err, body, response) => {
    expect(body['test']).to.equal('test')
    done()
  })
})
it('arr', function (done) {
  snd.call('/rev', [1, 2, 3], (err, body, response) => {
    expect(body).to.eql([3, 2, 1])
    done()
  })
})
after(function () {
  snd.stop()
  rcv.stop()
})
