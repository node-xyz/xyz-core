let CONSTANTS = require('./../Config/Constants');

function get(argName) {
  let args = process.argv;
  for (let idx = 2; idx < args.length; idx++) {
    if (args[idx] == argName) {
      return args[idx + 1]
    }
  }
  return CONSTANTS.commandline[argName.slice(2)];
}

function has(argName) {
  let args = process.argv;
  return args.indexOf(argName) > -1;
}


module.exports = {
  get: get,
  has: has
};
