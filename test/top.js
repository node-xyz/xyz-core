describe("basic", function () {
  require('./tests/basic');
});

describe('data Types', function () {
  require('./tests/dataTypes');
});

describe('transport middlewares', function () {
  require('./tests/middleware.transport');
});

describe('service middlewares', function () {
  require('./tests/middleware.service');
});
