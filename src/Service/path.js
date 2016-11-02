let logger = require('./../Log/Logger')

let Path = {
  validate: function (path) {
    if (path === '/') {
      return true
    }
    return /^(\/([a-zA-Z]|[1-9])+)*$/.test(path)
  },

  format: function (path) {
    if (path.slice(0, 1) !== '/') {
      path = '/' + path
    }
    if (path.slice(-1) === '/') {
      path = path.slice(0, -1)
    }
    return path
  },

  getTokes: function (path) {
    return path.split('/')
  }
}

module.exports = Path
