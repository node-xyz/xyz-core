let xyz = require('./xyz')

/**
 * some stuff
 * some stuff
 */
module.exports = xyz
module.exports.bootstrapFunctions = {
  'process.inspect.event': require('./src/Bootstrap/process.inspect.event'),
  'process.network.event': require('./src/Bootstrap/process.network.event')
}
