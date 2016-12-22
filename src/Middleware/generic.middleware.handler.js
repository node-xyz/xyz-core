// Generic Middleware Handler
// ----------
// This class is used in various modules to handle middlewares.
//
// A middleware is basically an array of functions
//
// `[fn1, fn2, fn3]`
//
// as we apply a set of parameters to a middleware (aka Middleware stack) these parameters will be passed to each function
// in this array. Functions have the ability to stop the execution of the next function.
//
// ```
// params = ['foo', 1]
// fn1(params)
// fn2(params)
// ...
// ```

const logger = require('./../Log/Logger')

class GenericMiddlewareHandler {
  // Generic middleware handler. it manages an array of functions and applies each of them on a target.
  // Note that one instance of this handler can work on multiple object at the same time
  // Sice the .apply method is indipendent of the state.

  constructor () {
    this.middlewares = []
    this.middlewareIndex = 0
  }

  // Registering a new middleware.<br>
  //
  // The number passed to as the first index will be the position of the function
  // **0** will prepend the function by default and -1 will append it
  // You'll use 0 most of the time
  register (index, fn) {
    logger.debug(`Registering middleware at ${index} : ${fn.name}`)
    if (index === -1) {
      this.middlewares.push(fn)
    } else if (index == 0) {
      this.middlewares.unshift(fn)
    }  else {
      this.middlewares.splice(index, 0 , fn)
    }
  }

  // apply a specific function from middleware array over a set of arguments.
  // Note that `.apply` will continue to call functions on parameters until the end of
  // the middleware array. should be called with
  //
  // `.apply([...], 0)`
  //
  // **Node** that each middleware funciton has access to `next` and `end` callback.
  // The names suggest what they do. `next` will immediately invoke the next function
  // and end will end the execution of the current stack
  //
  // **@param**  {array} params - Array of parameters passed to the handler
  //
  // **@param** {Number} index - current index inside the middleware array to be applied
  apply (params, index) {
    logger.silly(`applying middleware ${index}`)
    this.middlewares[index](params,
      (_params) => { // next
        if ((index + 1) < this.middlewares.length) {
          this.apply(params, index + 1)
        } else {
          logger.silly(`middleware Stack for ${params[0].url} finished`)
        }
      }, () => { // end
        logger.silly(`middleware Stack for ${params[0].uri} terminated by calling end()`)
      })
  }

  //  Return an array of middlewares registered so far.
  getMiddlewares () {
    return this.middlewares
  }

  // Remove a middleware form the stack
  remove (idx) {
    logger.silly(`removing middleware ${this.middlewareIndex}`)
    if (idx == -1) {
      this.middlewares = []
      this.middlewareIndex = 0
    } else if (idx > -1 && idx < this.middlewares.length) {
      this.middlewares.splice(idx, 1)
    } else {
      logger.error(`Trying to remove a middle ware that does not exists.`)
    }
  }
}

module.exports = GenericMiddlewareHandler
