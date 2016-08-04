const logger = require('./../Log/Logger');

class GenericMiddlewareHandler {
  constructor() {
    this.middlewares = [];
    this.middlewareIndex = 0;
  }

  register(index, fn) {
    logger.verbose(`Registering middleware at ${index} : ${fn.name}`);
    if (index === -1) {
      this.middlewares.push(fn);
    } else {
      this.middlewares.splice(0, index, fn)
    }
  }

  apply(params, index) {
    logger.silly(`applying middleware ${index}`);
    this.middlewares[index](params,
      (_params) => { //next
        if ((index + 1) < this.middlewares.length) {
          this.apply(params, index + 1);
        } else {
          logger.debug(`middleware Stack for ${params[0].url} finished`);
        }
      }, () => { // end
        logger.warn(`middleware Stack for ${params[0].uri} terminated by calling end()`)
      })
  }

  getMiddlewares() {
    return this.middlewares;
  }

  remove(idx) {
    logger.debug(`removing middleware ${this.middlewareIndex}`);
    if (idx == -1) {
      this.middlewares = [];
      this.middlewareIndex = 0;
    } else if (idx > -1 && idx < this.middlewares.length) {
      this.middlewares.splice(idx, 1);
    } else {
      logger.error(`Trying to remove a middle ware that does not exists.`)
    }
  }
}

module.exports = GenericMiddlewareHandler;
