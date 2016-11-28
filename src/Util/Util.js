function Random (time) {
  return Math.random() * time
}

function nodeStringToObject (str) {
  console.log(str)
  return {host: str.split(':')[0], port: str.split(':')[1]}
}

module.exports = {
  Random: Random,
  nodeStringToObject: nodeStringToObject
}
