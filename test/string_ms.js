var XYZ = require("./../index") ;

var ms = new XYZ("string") ;

function toUpper(str) {
  return str.toUpperCase()
}

function toLower(str) {
  return str.toLowerCase();
}

ms.register('up', function (data, response) {
  // TODO this should be more transparent.
  response.end(toUpper(data)) ;
}) ;

ms.register('down', function (data, response) {
  response(toLower(data.data))
}) ;


