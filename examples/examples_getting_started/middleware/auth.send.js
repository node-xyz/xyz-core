const SECRET = 'SECRET'

let authSend = function (params, next, end) {
  params[0].json.authorization = SECRET
  next()
}

module.exports = authSend
