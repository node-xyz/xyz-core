describe('basic', function () {
  require('./tests/basic')
})

describe('data Types', function () {
  require('./tests/dataTypes')
})

describe('transport middlewares', function () {
  require('./tests/middleware.transport')
})

describe('service middlewares', function () {
  require('./tests/middleware.service')
})

describe('transport authentication midlewares', function () {
  require('./tests/auth')
})

describe('events publish and subscribe', function () {
  require('./tests/events')
})
