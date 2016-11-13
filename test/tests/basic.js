const common = require('../common')
const expect = common.expect
const mockMicroservice = common.mockMicroService
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let snd
let rcv
let system
let cwd
before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  cwd = testSystem.cwd
  setTimeout(done, 1000)
})

it('hello world', function (done) {
  snd.call('/mul', {
    x: 2,
    y: 3
  }, (err1, body1, response1) => {
    expect(body1).to.equal(6)
    expect(err1).to.equal(null)
    expect(response1.statusCode).to.equal(200)
    snd.call('/up', 'hello', (err2, body2, response2) => {
      expect(body2).to.equal('HELLO')
      expect(err2).to.equal(null)
      expect(response2.statusCode).to.equal(200)
      done()
    })
  })
})

it('local not found', function (done) {
  snd.call('/mullll', {
    x: 2,
    y: 3
  }, (err, body, resp) => {
    expect(body).to.equal(null)
    expect(err).to.equal(http.STATUS_CODES[404])
    done()
  })
})

it('no Callback for sender call', function (done) {
  snd.call('mul', {x: 2,y: 3})
  done()
})

after(function () {
  snd.stop()
  rcv.stop()
})
