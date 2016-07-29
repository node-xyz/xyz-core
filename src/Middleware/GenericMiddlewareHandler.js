const logger = require('./../Log/Logger');
class GenericMiddlewareHandler {
  constructor(){
    this.middlewares = [] ;
    this.middlewareIndex = 0 ;
  }

  add(fn) {
    this.middlewares.push(fn) ;
  }

  apply(params) {
    this.middlewares[this.middlewareIndex](params, () => {
      logger.debug(`Transport middleware ${this.middlewareIndex} applied.`);
      this.middlewareIndex += 1 ;
      if ( this.middlewareIndex < this.middlewares.length) {
        this.apply(params);
      }
      else {
        this.middlewareIndex = 0 ;
      }
    })
  }
}

module.exports = GenericMiddlewareHandler;