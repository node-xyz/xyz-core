const logger = require('./../../Log/Logger');
const CONSTANTS = require('./../../Config/Constants');
const url = require('url');

function passToRepo(params, next) {
  let request = params[0];
  let response = params[1];
  let body = params[2];
  let _transport = params[3];

  logger.debug(`PING :: Passing ping to up to service repo`);
  _transport.emit(CONSTANTS.events.PING,response);
  next();
}

module.exports = passToRepo;
