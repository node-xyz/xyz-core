let winston = require('winston');
const wrapper = require('./../Util/ansi.colors').wrapper;

function levelColor(level) {
  if (level === "silly") {
    return wrapper('magenta', level)
  }
  if (level === "debug") {
    return wrapper('cyan', level)
  }
  if (level === "verbose") {
    return wrapper('blue', level)
  }
  if (level === "info") {
    return wrapper('green', level)
  }
  if (level === "warn") {
    return wrapper('yellow', level)
  }
  if (level === "error") {
    return wrapper('red', level)
  }
}
//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: false,
      prettyPrint: true,
      colorize: true,
      level: 'verbose',
      timestamp: function () {
        return Date.now();
      },
      formatter: function (options) {
        // Return string will be passed to logger.
        return `${levelColor(options.level)} :: ${options.message} \t\t ${wrapper('underline', wrapper('bold', global._serviceName))} `
      }
    })
  ],
  exitOnError: false
});

module.exports = logger;
