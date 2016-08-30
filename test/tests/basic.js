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
  rcv.register('mul', mockFunctions.mul)
  rcv.register('up', mockFunctions.up)
  setTimeout(done, 500)
})

it('hello world', function (done) {
  snd.call('mul', {
    x: 2,
    y: 3
  }, (err1, body1, response1) => {
    expect(body1).to.equal(6)
    expect(err1).to.equal(null)
    expect(response1.statusCode).to.equal(200)
    snd.call('up', 'hello', (err2, body2, response2) => {
      expect(body2).to.equal('HELLO')
      expect(err2).to.equal(null)
      expect(response2.statusCode).to.equal(200)
      done()
    })
  })
})

it('local not found', function (done) {
  snd.call('mullll', {
    x: 2,
    y: 3
  }, (err, body, resp) => {
    expect(body).to.equal(null)
    expect(err).to.equal(http.STATUS_CODES[404])
    done()
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
