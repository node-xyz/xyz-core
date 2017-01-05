const common = require('../common')
let logger = require('./../../src/Log/Logger')
const expect = common.expect
const mockNode = common.mockNode
const mockSystem = common.mockSystem
const mockFunctions = common.mockFunctions
const http = require('http')

let cwd, system, snd, rcv
let str = 'manipulated'

function wrongServicediscoveryMiddleware (params, next, end, xyz) {
  let servicePath = params[0],
    userPayload = params[1],
    foreignNodes = xyz.serviceRepository.foreignNodes,
    transportClient = xyz.serviceRepository.transportClient
  responseCallback = params[2]

  let serviceTokens = servicePath.split('/')

  for (let node in foreignNodes) {
    let servicePathIndex = 0
    let pathTree = foreignNodes[node]
    let match = false
    while (Object.keys(pathTree).length) {
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
  snd.call({servicePath: 'up', payload: 'what the hell'}, (err, body, response) => {
    // this is exacly end of request event on serviceRepository
    expect(response.statusCode).to.equal(404)
    expect(body).to.equal(http.STATUS_CODES[404])
    snd.middlewares().serviceRepository.callDispatch.remove(0)
    snd.middlewares().serviceRepository.callDispatch.register(-1, common.firstfind)
    done()
  })
})

it('changeMiddlewareOnTheFly - Hot Swap', function (done) {
  snd.call({servicePath: 'up', payload: 'will be ok'}, (err, body, response) => {
    expect(body).to.equal('WILL BE OK')
    snd.middlewares().serviceRepository.callDispatch.remove(-1)
    snd.middlewares().serviceRepository.callDispatch.register(-1, wrongServicediscoveryMiddleware)
    snd.call({servicePath: 'up', payload: 'will be not OK'}, (err, body, response) => {
      expect(body).to.equal(http.STATUS_CODES[404])
      snd.middlewares().serviceRepository.callDispatch.remove(0)
      done()
    })
  })
})

it('change sendStrategy per call', function (done) {
  snd.call({servicePath: '/math/*', payload: {x: 2,y: 2}, sendStrategy: require('xyz.service.send.to.all')}, (err, body, response) => {
    expect(err).to.equal(null)
    // expecting three results
    expect(Object.keys(body).length).to.equal(3)
    done()
  })
})

after(function () {
  snd.stop()
  rcv.stop()
})
