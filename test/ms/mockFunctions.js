module.exports = {
  mul: function mul(data, response) { response.end((data.x * data.y).toString()) },
  add: function add(data, response) { response.end((data.x + data.y).toString()) },
  up: function (data, response) {
    response.end(data.str.toUpperCase());
  },
  down: function (data, response) {
    response(data.str.toLowerCase());
  }
};