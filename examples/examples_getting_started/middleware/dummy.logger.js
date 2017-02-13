let dummyLogger = function (params, next, end) {
  console.log('i was called! now what?')
  console.log(params)
  next()
}
module.exports = dummyLogger
