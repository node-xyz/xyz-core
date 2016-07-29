const logger = require('./../../Log/Logger');
const CONSTANTS = require('./../../Config/Constants');
const url = require('url');

function passToRepo(params, next) {
  let request = params[0];
  let response = params[1];
  let body = params[2];
  let _transport = params[3];

  logger.debug(`Passing request to ${request.url} up to service repo`);
  _transport.emit(
      CONSTANTS.events.REQUEST,
      { userPayload: JSON.parse(body).userPayload, serviceName: url.parse(request.url).query.split('=')[1] },
      response);
  next();
}

module.exports = passToRepo;
