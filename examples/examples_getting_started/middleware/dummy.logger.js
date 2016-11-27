let dummyLogger = function (params, next, end) {
  console.log('i was called! now what?')
  console.log(params[0])
  console.log(params[1])
  next()
}
module.exports = dummyLogger
