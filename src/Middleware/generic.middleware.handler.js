const logger = require('./../Log/Logger')
const wrapper = require('./../Util/Util').wrapper

/**
 * This class is used in various modules to handle middlewares.
 *
 * A middleware is basically an array of functions
 *
 * `[fn1, fn2, fn3]`
 *
 * as we apply a set of parameters to a middleware (aka Middleware stack) these parameters will be passed to each function
 * in this array. Functions have the ability to stop the execution of the next function.
 *
 * ```
 * params = ['foo', 1]
 * fn1(params)
 * fn2(params)
 * ...
 * ```
 */
class GenericMiddlewareHandler {
  constructor (xyz, name, route) {
    this.middlewares = []
    this.middlewareIndex = 0
    this.xyz = xyz
    this.name = name
    this.route = route
  }

  /**
   * prints the info of this class
   */
  inspect () {
    let str = this.route
    ? `${wrapper('bold', this.name)} [/${wrapper('yellow', this.route)}] || `
    : `${wrapper('bold', this.name)} || `

    for (let i = 0; i < this.middlewares.length; i++) {
      if (i === this.middlewares.length - 1) {
        str += `${this.middlewares[i].name}[${i}]`
      } else {
        str += `${this.middlewares[i].name}[${i}] -> `
      }
    }

    return str
  }

  /**
   * same data returned by `inspect` is returened in json format
   */
  inspectJSON () {
    return {
      name: this.name,
      middlewares: this.middlewares.map((mw) => mw.name)
    }
  }

  /**
   * Registering a new middleware
   *
   * The number passed to as the first index will be the position of the function
   * **0** will prepend the function by default and **-1** will append it
   * You'll use 0 most of the time
   * @param index {Number} index of insertion
   * @param fn {Function} function to be invoked
   */
  register (index, fn) {
    logger.debug(`Registering middleware at ${this.name}[${index}] : ${fn.name}`)
    if (index === -1) {
      this.middlewares.push(fn)
    } else if (index === 0) {
      this.middlewares.unshift(fn)
    } else {
      this.middlewares.splice(index, 0, fn)
    }
  }

  /**
   * apply a specific function from middleware array over a set of arguments
   *
   * Note that `.apply` will continue to call functions on parameters until the end of
   * the middleware array
   *
   * should be called with
   * `.apply([...], 0)`
   *
   * Note that each middleware funciton has access to `next` and `end` callback.
   * The names suggest what they do. `next` will immediately invoke the next function
   * and end will end the execution of the current stack
   * @param  {array} params - Array of parameters passed to the handler
   * @param {Number} index - current index inside the middleware array to be applied
   */
  apply (params, index) {
    logger.silly(`applying middleware ${this.name}[${index}]`)

    this.middlewares[index](params,
      (_params) => { // next
        if ((index + 1) < this.middlewares.length) {
          this.apply(params, index + 1, this.xyz)
        } else {
          logger.silly(`middleware Stack for ${this.name} finished`)
        }
      }, () => { // end
        logger.silly(`middleware Stack for ${this.name} terminated by calling end()`)
      }, this.xyz)
  }

  /**
   * Return an array of middlewares registered so far.
   */
  getMiddlewares () {
    return this.middlewares
  }

  /**
   * remove a middleware from the stack
   * @param {Number} idx - the idx of the removal. if `idx` is -1, then all of the functions will be removed
   * otherwise, the function at index `idx` will be removed
   */
  remove (idx) {
    logger.silly(`removing middleware ${this.name}[${this.middlewareIndex}]`)
    if (idx === -1) {
      this.middlewares = []
      this.middlewareIndex = 0
    } else if (idx > -1 && idx < this.middlewares.length) {
      this.middlewares.splice(idx, 1)
    } else {
      logger.error('Trying to remove a middleware that does not exists.')
    }
  }
}

module.exports = GenericMiddlewareHandler
