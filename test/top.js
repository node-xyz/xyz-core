describe('basic', function () {
  require('./tests/basic')
})

describe.skip('data Types', function () {
  require('./tests/dataTypes')
})

describe.skip('transport middlewares', function () {
  require('./tests/middleware.transport')
})

describe.skip('service middlewares', function () {
  require('./tests/middleware.service')
})

describe.skip('transport authentication midlewares', function () {
  require('./tests/auth')
})

describe('events publish and subscribe', function () {
  require('./tests/events')
})
