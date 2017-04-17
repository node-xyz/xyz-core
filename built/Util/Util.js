"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Random(time) {
    return Math.random() * time;
}
exports.Random = Random;
function nodeStringToObject(str) {
    return { host: str.split(':')[0], port: str.split(':')[1] };
}
exports.nodeStringToObject = nodeStringToObject;
function _require(name) {
    // if the user has passed a require object to the XYZ()
    if (typeof (name) === 'object' || typeof (name) === 'function')
        return name;
    var ret;
    try {
        import aModule from "./../Service/" + name;
        ret = module_1.default;
    }
    catch (e) {
        ret = false;
    }
    finally {
        return ret;
    }
}
exports._require = _require;
exports.colors = {
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
};
function wrapper(style, str) {
    return "" + exports.colors[style] + str + exports.colors['reset'];
}
exports.wrapper = wrapper;
function bold(str) {
    return wrapper('bold', str);
}
exports.bold = bold;
