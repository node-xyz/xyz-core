let xyz = require('./built/xyz.js')

module.exports = xyz.default
module.exports.bootstrapFunctions = {
  'process.inspect.event': require('./built/Bootstrap/process.inspect.event'),
  'process.network.event': require('./built/Bootstrap/process.network.event')
}
