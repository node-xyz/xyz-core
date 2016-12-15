let xyz = require('./xyz')
let logger = require('./src/Log/Logger')
let path = require('./src/Service/path')
let CONFIG = require('./src/Config/config.global')

module.exports = {
  xyz: xyz,
  logger: logger,
  path: path,
  CONFIG: CONFIG,
  Util: require('./src/Util/Util'),
  logUtils: require('./src/Util/ansi.colors')
}
