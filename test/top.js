describe('basic', function () {
  describe('basic test as a hello world', function () {
    require('./tests/basic')
  })
})

describe('clusters', function () {
  describe('add and remove nodes in cluster', function () {
    require('./tests/cluster')
  })
})

describe('data Types', function () {
  describe('testing different data types', function () {
    require('./tests/dataTypes')
  })
})

describe('transport middlewares', function () {
  describe('transport middleware test', function () {
    require('./tests/middleware.transport')
  })
})

describe('service middlewares', function () {
  describe('service layer middleware', function () {
    require('./tests/middleware.service')
  })
})

describe('different transport layers', function () {
  describe('UDP', function () {
    require('./tests/udp.message')
  })
})

describe('Path Handling', function () {
  describe('Static path tests', function () {
    require('./tests/path')
  })
})

describe('events', function () {
  describe('basic events', function () {
    require('./tests/events')
  })
})

describe('routes and servers', function () {
  describe('basic routing', function () {
    require('./tests/multiple.routes')
  })

  describe('basic server management', function () {
    require('./tests/multiple.servers')
  })
})

describe('inspections', function () {
  require('./tests/inspect')
})

describe.skip('Ping', function () {
  describe('heartbeat-based pings', function () {
    require('./tests/ping.types')
  })
})

// describe.skip('bootstrap functions', function () {
  // require('./tests')
// })
