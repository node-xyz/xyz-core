function Random (time) {
  return Math.random() * time
}

function nodeStringToObject (str) {
  return {host: str.split(':')[0], port: str.split(':')[1]}
}

function _require (name) {
  // if the user has passed a require object to the XYZ()
  if (typeof (name) === 'object' || typeof(name) === 'function')
    return name

  let ret
  try {
    ret = require(`./../Service/${name}`)
  } catch (e) {
    ret = false
  } finally {
    return ret
  }
}

let colors = {
  "reset": "\033[0m",
  "bold": "\033[1m",
  "boldoff": "\033[22m",
  "underline": "\033[4m",
  "inverse": "\033[7m",
  // foreground colors
  "black": "\033[30m",
  "red": "\033[31m",
  "green": "\033[32m",
  "yellow": "\033[33m",
  "blue": "\033[34m",
  "magenta": "\033[35m",
  "cyan": "\033[36m",
  "white": "\033[37m",
  // background colors
  "bg_black": "\033[40m",
  "bg_red": "\033[41m",
  "bg_green": "\033[42m",
  "bg_yellow": "\033[43m",
  "bg_blue": "\033[44m",
  "bg_magenta": "\033[45m",
  "bg_cyan": "\033[46m",
  "bg_white": "\033[47m"
}

function wrapper(style, str) {
  return `${colors[style]}${str}${colors['reset']}`
}

bold(str) {
  return wrapper('bold', str)
}

module.exports = {
  Random: Random,
  _require: _require,
  nodeStringToObject: nodeStringToObject,
  colors: colors,
  wrapper: wrapper,
  bold: bold
}
