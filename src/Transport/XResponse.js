module.exports = function (resposenObject) {
  resposenObject['jsonify'] = (data, ...args) => {
    resposenObject.end(JSON.stringify(data), ...args)
  }
}
