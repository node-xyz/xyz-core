const logger = require('./../Log/Logger');
class GenericMiddlewareHandler {
  constructor(){
    this.middlewares = [] ;
    this.middlewareIndex = 0 ;
  }

  register(index, fn) {
    logger.silly(`Registering middleware at ${index} : ${fn.name}`);
    if ( index === -1 ){
      this.middlewares.push(fn) ;
    }
    else {
      this.middlewares.splice(0, index, fn)
    }
  }

  apply(params) {
    logger.silly(`applying middleware ${this.middlewareIndex}`);
    this.middlewares[this.middlewareIndex](params,
      (_params) => { // next
        this.middlewareIndex += 1 ;
        if ( this.middlewareIndex < this.middlewares.length) {
          this.apply(params);
        }
        else {
          this.middlewareIndex = 0 ;
        }
    },
    () => { // end
      this.middlewareIndex = 0 ;
    })
  }

  getMiddlewares() {
    return this.middlewares;
  }
}

module.exports = GenericMiddlewareHandler;
