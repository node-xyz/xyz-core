import { CONSTANTS } from './../Config/Constants';

export function get (argName) {
  let args = process.argv
  for (let idx = 2; idx < args.length; idx++) {
    if (args[idx] === argName) {
      return args[idx + 1]
    }
  }
}

export function has (argName) {
  let args = process.argv
  return args.indexOf(argName) > -1
}

export function xyzGeneric (prefix = '--xyz-') {
  let args = process.argv
  let _args = {}
  for (let idx = 2; idx < args.length; idx++) {
    let arg = args[idx]
    if (arg.slice(0, 6) === prefix) {
      let specificArg = arg.slice(6)
      if (_args[specificArg]) {
        if (typeof (_args[specificArg]) !== 'object') {
          _args[specificArg] = [_args[specificArg]]
        }
        _args[specificArg].push(args[idx + 1])
      } else {
        _args[specificArg] = args[idx + 1]
      }
      idx += 1
    }
  }
  return _args
}
