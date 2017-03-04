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
  let servicePath = params[0].servicePath,
    userPayload = params[0].payload,
    foreignNodes = xyz.serviceRepository.foreignNodes,
    transportClient = xyz.serviceRepository.transport
  responseCallback = params[1]

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
    if (!match) {
      logger.info(`WRONG DISCOVERY :: determined ${node} for ${servicePath}`)
      transportClient.send({ node: node, route: 'CALL', payload: {userPayload: userPayload, service: servicePath}}, (err, body, response) => {
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

it('change sendStrategy per call - sendToAll', function (done) {
  snd.call({servicePath: '/math/*', payload: {x: 2, y: 2}, sendStrategy: common.sendToAll}, (err, body, response) => {
    expect(err).to.equal(null)
    // expecting three results
    expect(Object.keys(body).length).to.equal(3)
    done()
  })
})

it('send to target - correct usage', function (done) {
  let sentToTarget = require('./../../src/Service/Middleware/service.sent.to.target')
  snd.call({
    servicePath: '/math/mul',
    payload: {x: 2, y: 3},
    sendStrategy: sentToTarget(`127.0.0.1:${rcv.xyz.id().port}`)},
    (err, body, resp) => {
      expect(body).to.equal(6)
      done()
    }
  )
})

it('send to target - wrong usage', function (done) {
  let sentToTarget = require('./../../src/Service/Middleware/service.sent.to.target')
  snd.call({
    servicePath: '/math/mul',
    payload: {x: 2, y: 3},
    sendStrategy: sentToTarget(`127.0.0.1:${rcv.xyz.id().port + 200}`)},
    (err, body, resp) => {
      expect(err).to.not.equal(null)
      expect(body).to.equal(null)
      done()
    }
  )
})

it('broadcast local - correct case', function (done) {
  let broadcast = require('./../../src/Service/Middleware/service.broadcast.local')
  snd.call({
    servicePath: '/math/mul',
    payload: {x: 2, y: 3},
    sendStrategy: broadcast},
    (err, body, resp) => {
      console.log(err, body)
      expect(err).to.equal(null)
      let responses = body
      expect(Object.keys(responses)).to.have.lengthOf(2)

      // snd
      expect(responses[`127.0.0.1:3334:/math/mul`][0]).to.equal(http.STATUS_CODES[404])
      expect(responses[`127.0.0.1:3334:/math/mul`][1]).to.equal(http.STATUS_CODES[404])

      // rcv
      expect(responses[`127.0.0.1:3333:/math/mul`][0]).to.equal(null)
      expect(responses[`127.0.0.1:3333:/math/mul`][1]).to.equal(2 * 3)
      done()
    }
  )
})

it('broadcast local - wrong case', function (done) {
  let broadcast = require('./../../src/Service/Middleware/service.broadcast.local')
  snd.call({
    servicePath: '/math/*', // will not work cos the receiver can not resolve this
    payload: {x: 2, y: 3},
    sendStrategy: broadcast},
    (err, body, resp) => {
      expect(err).to.equal(null)
      let responses = body
      expect(Object.keys(responses)).to.have.lengthOf(2)

      // snd
      expect(responses['127.0.0.1:3334:/math/*'][0]).to.equal(http.STATUS_CODES[404])
      expect(responses['127.0.0.1:3334:/math/*'][1]).to.equal(http.STATUS_CODES[404])

      // rcv
      expect(responses['127.0.0.1:3333:/math/*'][0]).to.equal(http.STATUS_CODES[404])
      expect(responses['127.0.0.1:3333:/math/*'][1]).to.equal(http.STATUS_CODES[404])
      done()
    }
  )
})

it('broadcast global - correct case', function (done) {
  let broadcast = require('./../../src/Service/Middleware/service.broadcast.global')
  snd.call({
    servicePath: '/math/mul',
    payload: {x: 2, y: 3},
    sendStrategy: broadcast},
    (err, body, resp) => {
      expect(err).to.equal(null)
      let responses = body
      expect(Object.keys(responses)).to.have.lengthOf(2)

      // snd
      expect(responses['127.0.0.1:3334:/math/mul'][0]).to.equal(http.STATUS_CODES[404])
      expect(responses['127.0.0.1:3334:/math/mul'][1]).to.equal(http.STATUS_CODES[404])

      // rcv
      expect(responses['127.0.0.1:3333:/math/mul'][0]).to.equal(null)
      expect(responses['127.0.0.1:3333:/math/mul'][1]).to.equal(2 * 3)
      done()
    }
  )
})

it('broadcast global - wrong case', function (done) {
  let broadcast = require('./../../src/Service/Middleware/service.broadcast.global')
  snd.call({
    servicePath: '/math/*', // will not work cos the receiver can not resolve this
    payload: {x: 2, y: 3},
    sendStrategy: broadcast},
    (err, body, resp) => {
      expect(err).to.equal(null)
      let responses = body
      expect(Object.keys(responses)).to.have.lengthOf(2)

      // snd
      expect(responses['127.0.0.1:3334:/math/*'][0]).to.equal(http.STATUS_CODES[404])
      expect(responses['127.0.0.1:3334:/math/*'][1]).to.equal(http.STATUS_CODES[404])

      // rcv
      expect(responses['127.0.0.1:3333:/math/*'][0]).to.equal(http.STATUS_CODES[404])
      expect(responses['127.0.0.1:3333:/math/*'][1]).to.equal(http.STATUS_CODES[404])
      done()
    }
  )
})

after(function () {
  snd.stop()
  rcv.stop()
})
