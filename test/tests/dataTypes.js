const common = require('../common')
let expect = common.expect
let mockMicroservice = common.mockMicroService
let mockFunctions = common.mockFunctions
let mockSystem = common.mockSystem

var snd
var rcv
before(function (done) {
  cwd = __filename.slice(0, __filename.lastIndexOf('/'))
  system = new mockSystem(cwd)
  system.addMicroservice({
    host: "http://localhost",
    port: 3333
  })
  system.addMicroservice({
    host: "http://localhost",
    port: 3334
  })
  system.write()
  snd = new mockMicroservice('snd', 3334, cwd)
  rcv = new mockMicroservice('rcv', 3333, cwd)
  rcv.register('rev', mockFunctions.rev)
  rcv.register('neg', mockFunctions.neg)
  rcv.register('finger', mockFunctions.finger)
  setTimeout(done, 500)
})
it('bool', function (done) {
  snd.call('neg', false, (err, response, body) => {
    expect(body).to.equal(true)
    done()
  })
})
it('obj', function (done) {
  snd.call('finger', {
    data: 'data'
  }, (err, response, body) => {
    expect(body['test']).to.equal('test')
    done()
  })
})
it('arr', function (done) {
  snd.call('rev', [1, 2, 3], (err, response, body) => {
    expect(body).to.eql([3, 2, 1])
    done()
  })
})
after(function () {
  snd.stop()
  rcv.stop()
})
