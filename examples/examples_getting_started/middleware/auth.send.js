const SECRET = 'SECRET'

let authSend = function (params, next, end) {
  params[0].json.authorization = SECRET
  console.log('auth header added')
  next()
}

module.exports = authSend
