module.exports = {
  mul: function mul(data, response) { response.end(JSON.stringify(data.x * data.y)) },
  add: function add(data, response) { response.end(JSON.stringify(data.x + data.y)) },
  up: function (data, response) {
    response.end(data.toUpperCase());
  },
  down: function (data, response) {
    response.end(data.toLowerCase());
  },
  neg: function (data, response) {
    // TODO not good
    response.end(JSON.stringify(!Boolean(data)));
  },
  rev: function (data, response) {
    response.end(JSON.stringify(data.reverse()))
  },
  finger: function (data, response) {
    data['test'] = 'test';
    response.end(JSON.stringify(data));
  }
};