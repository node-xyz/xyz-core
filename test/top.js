describe('basic', function () {
  describe('basic test as a hello world', function () {
    require('./tests/basic')
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

describe('transport authentication midlewares', function () {
  describe('simple authentication', function () {
    require('./tests/auth')
  })
})

describe('cluster and cluster events', function () {
  describe('add and remove nodes', function () {
    require('./tests/events.and.cluster')
  })
})

describe('Path Handling', function () {
  describe('Static path tests', function () {
    require('./tests/path')
  })
})
