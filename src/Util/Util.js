function Random (time) {
  return Math.random() * time
}

function nodeStringToObject (str) {
  return {host: str.split(':')[0], port: str.split(':')[1]}
}

function _require (name) {
  // if the user has passed a require object to the XYZ()
  if (typeof (name) === 'object')
    return name

  let ret
  try {
    ret = require(name)
  } catch (e) {
    ret = false
  } finally {
    return ret
  }
}

module.exports = {
  Random: Random,
  _require: _require,
  nodeStringToObject: nodeStringToObject
}
