Object.defineProperty(exports, "__esModule", { value: true });
var winston = require('winston');
var Util_1 = require("./../Util/Util");
function levelColor(level) {
    if (level === 'silly') {
        return Util_1.wrapper('magenta', level);
    }
    if (level === 'debug') {
        return Util_1.wrapper('cyan', level);
    }
    if (level === 'verbose') {
        return Util_1.wrapper('blue', level);
    }
    if (level === 'info') {
        return Util_1.wrapper('green', level);
    }
    if (level === 'warn') {
        return Util_1.wrapper('yellow', level);
    }
    if (level === 'error') {
        return Util_1.wrapper('red', level);
    }
}
function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    return str;
}
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
exports.logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            handleExceptions: false,
            prettyPrint: false,
            colorize: true,
            level: 'debug',
            timestamp: function () {
                return Date.now();
            },
            formatter: function (options) {
                // Return string will be passed to logger.
                return "[" + getFormattedDate() + "][" + Util_1.wrapper('underline', Util_1.wrapper('bold', global._serviceName)) + "] " + Util_1.wrapper('bold', levelColor(options.level)) + " :: " + options.message + " ";
            }
        })
    ],
    exitOnError: false
});
