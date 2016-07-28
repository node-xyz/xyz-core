var winston = require('winston');
//{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      prettyPrint: true,
      colorize: true,
      level: 'silly'
    })
  ],
  exitOnError: false
});

module.exports = logger;
