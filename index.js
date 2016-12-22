let xyz = require('./xyz')
let logger = require('./src/Log/Logger')
let path = require('./src/Service/path')
let CONFIG = require('./src/Config/config.global')
const CONSTANTS = require('./src/Config/Constants')

module.exports = {
  xyz: xyz,
  logger: logger,
  path: path,
  CONSTANTS: CONSTANTS,
  Util: require('./src/Util/Util')
}
