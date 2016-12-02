module.exports = {
  mul: function mul (payload, xResponse) {
    xResponse.send(payload.x * payload.y)
  },
  add: function add (payload, xResponse) {
    xResponse.send(payload.x + payload.y)
  },
  sub: function add (payload, xResponse) {
    xResponse.send(payload.x - payload.y)
  },
  up: function (payload, xResponse) {
    xResponse.send(payload.toUpperCase())
  },
  down: function (payload, xResponse) {
    xResponse.send(payload.toLowerCase())
  },
  neg: function (payload, xResponse) {
    xResponse.send(!Boolean(payload))
  },
  rev: function (payload, xResponse) {
    xResponse.send(payload.reverse())
  },
  finger: function (payload, xResponse) {
    payload['test'] = 'test'
    xResponse.send(payload)
  }
}
