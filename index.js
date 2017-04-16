let xyz = require('./built/xyz.js')

/**
 * some stuff
 * some stuff
 */
module.exports = xyz
module.exports.bootstrapFunctions = {
  'process.inspect.event': require('./built/Bootstrap/process.inspect.event'),
  'process.network.event': require('./built/Bootstrap/process.network.event')
}
