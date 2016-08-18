const logger = require('./../Log/Logger');

/**
 * generic middleware handler
 */
class GenericMiddlewareHandler {
  /**
   * Generic middleware handler. it manages an array of functions and applies each of them on a target.
   * Note that one instance of this handler can work on multiple object at the same time
   * Sice the .apply method is indipendent of the state.
   */

  constructor() {
    this.middlewares = [];
    this.middlewareIndex = 0;
  }

  /**
   * Registering a new middleware.
   * @param  {Number} index - index to insert the middleware at. if -1, middleware will be pushed to the end.
   */
  register(index, fn) {
    logger.silly(`Registering middleware at ${index} : ${fn.name}`);
    if (index === -1) {
      this.middlewares.push(fn);
    } else {
      this.middlewares.splice(0, index, fn)
    }
  }

  /**
   * apply a specific function from middleware array over a set of arguments
   * @param  {array} params - Array of parameters passed to the handler
   * @param {Number} index - current index inside the middleware array to be applied
   */
  apply(params, index) {
    logger.silly(`applying middleware ${index}`);
    this.middlewares[index](params,
      (_params) => { //next
        if ((index + 1) < this.middlewares.length) {
          this.apply(params, index + 1);
        } else {
          logger.silly(`middleware Stack for ${params[0].url} finished`);
        }
      }, () => { // end
        logger.silly(`middleware Stack for ${params[0].uri} terminated by calling end()`)
      })
  }

  /**
   * Return an array of middlewares registered so far.
   * @return {Array} array of middlewares
   */
  getMiddlewares() {
    return this.middlewares;
  }

  remove(idx) {
    logger.silly(`removing middleware ${this.middlewareIndex}`);
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
