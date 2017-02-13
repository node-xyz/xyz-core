const SECRET = 'SECRET'

let authReceive = function (params, next, end) {
  console.log(params[2])
  let authorization = params[2].authorization

  if (authorization === SECRET) {
    console.log('auth accpeted')
    next()
  } else {
    console.log('auth failed')
    // it's better to also close the request immediately
    params[0].destroy()
    end()
  }
}

module.exports = authReceive
