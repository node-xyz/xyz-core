module.exports = {
  mul: function mul (payload, xResponse) {
    xResponse.jsonify(payload.x * payload.y)
  },
  add: function add (payload, xResponse) {
    xResponse.jsonify(payload.x + payload.y)
  },
  sub: function add (payload, xResponse) {
    if (xResponse) xResponse.jsonify(payload.x - payload.y)
  },
  up: function (payload, xResponse) {
    xResponse.jsonify(payload.toUpperCase())
  },
  down: function (payload, xResponse) {
    xResponse.jsonify(payload.toLowerCase())
  },
  neg: function (payload, xResponse) {
    xResponse.jsonify(!payload)
  },
  rev: function (payload, xResponse) {
    xResponse.jsonify(payload.reverse())
  },
  finger: function (payload, xResponse) {
    payload['test'] = 'test'
    xResponse.jsonify(payload)
  },
  blank: function (payload, xResponse) {
    xResponse.writeHead(201)
    xResponse.jsonify('blank')
  },
  none: function (payload, xResponse) {
    console.log(payload)
  }
}
