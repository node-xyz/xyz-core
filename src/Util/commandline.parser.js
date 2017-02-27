let CONSTANTS = require('./../Config/Constants')

function get (argName) {
  let args = process.argv
  for (let idx = 2; idx < args.length; idx++) {
    if (args[idx] === argName) {
      return args[idx + 1]
    }
  }
  return CONSTANTS.commandline[argName.slice(2)]
}

function has (argName) {
  let args = process.argv
  return args.indexOf(argName) > -1
}

function xyzGeneric (prefix = '--xyz-') {
  let args = process.argv
  let _args = {}
  for (let idx = 2; idx < args.length; idx++) {
    let arg = args[idx]
    if (arg.slice(0, 6) === prefix) {
      let specificArg = arg.slice(6)
      _args[specificArg] = args[idx + 1]
      idx += 1
    }
  }
  return _args
}

module.exports = {
  get: get,
  has: has,
  xyzGeneric: xyzGeneric
}
