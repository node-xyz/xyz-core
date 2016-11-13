const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockMicroservice = common.mockMicroService
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let snd
let rcv
let system
let cwd
let str = 'manipulated'

function wrongServicediscoveryMiddleware (params, next, end) {
  let servicePath = params[0],
    userPayload = params[1],
    foreignNodes = params[2],
    transportClient = params[3]
  responseCallback = params[4]

  let serviceTokens = servicePath.split('/')

  for (let node in foreignNodes) {
    let servicePathIndex = 0
    let pathTree = foreignNodes[node]
    let match = false
    while (Object.keys(pathTree).length) {
      console.log(node, pathTree)
      if (pathTree[serviceTokens[servicePathIndex]]) {
        pathTree = pathTree[serviceTokens[servicePathIndex]]
        servicePathIndex += 1
        if (servicePathIndex === serviceTokens.length) {
          match = true
        }
      } else {
        break
      }
    }
    if (! match) {
      logger.info(`WRONG DISCOVERY :: determined ${node} for ${servicePath}`)
      transportClient.send(servicePath, node, userPayload, (err, body, response) => {
        responseCallback(err, body, response)
      })
      return
    }
  }
}

before(function (done) {
  let testSystem = common.init()
  snd = testSystem.snd
  rcv = testSystem.rcv
  system = testSystem.system
  cwd = testSystem.cwd

  setTimeout(done, 500)
})

it('False servicrDiscovery', function (done) {
  snd.middlewares().serviceRepository.callDispatch.remove(-1)
  snd.middlewares().serviceRepository.callDispatch.register(-1, wrongServicediscoveryMiddleware)
  snd.call('up', 'what the hell', (err, body, response) => {
    // this is exacly end of request event on serviceRepository
    expect(response.statusCode).to.equal(404)
    expect(body).to.equal(http.STATUS_CODES[404])
    snd.middlewares().serviceRepository.callDispatch.remove(0)
    snd.middlewares().serviceRepository.callDispatch.register(-1, require('./../../src/Service/Middlewares/call.middleware.first.find'))
    done()
  })
})

it('changeMiddlewareOnTheFly - Hot Swap', function (done) {
  snd.call('up', 'will be ok', (err, body, response) => {
    expect(body).to.equal('WILL BE OK')
    snd.middlewares().serviceRepository.callDispatch.remove(-1)
    snd.middlewares().serviceRepository.callDispatch.register(-1, wrongServicediscoveryMiddleware)
    snd.call('up', 'will be not OK', (err, body, response) => {
      expect(body).to.equal(http.STATUS_CODES[404])
      snd.middlewares().serviceRepository.callDispatch.remove(0)
      done()
    })
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
