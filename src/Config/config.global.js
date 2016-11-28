let CONSTANTS = require('./../Config/Constants')
let argParser = require('./../Util/commandline.parser')
let logger = require('./../Log/Logger')

let systemConf
let selfConf = {}

function MergeRecursive (obj1, obj2) {
  for (var p in obj2) {
    try {
      if (obj2[p].constructor == Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p])
      } else {
        obj1[p] = obj2[p]
      }
    } catch(e) {
      obj1[p] = obj2[p]
    }
  }
  return obj1
}

let configuration = {
  joinNode: (aNode) => {
    if (systemConf.microservices.indexOf(aNode) > -1) {
      logger.error(`Node ${aNode} already in systemConf. Passing.`)
    }
    systemConf.microservices.push(aNode)
  },

  kickNode: (aNode) => {
    let index = systemConf.microservices.indexOf(aNode)
    if (index > -1)
      systemConf.microservices.splice(systemConf.microservices.indexOf(aNode), 1)
    else
      logger.warn(`Attempting to remove ${aNode} which does not exist`)
  },

  setSelfConf: (aConf) => {
    logger.info('Setting default selfConf')
    selfConf = CONSTANTS.defaultConfig.selfConf
    logger.info('Reading selfConf from user')
    // TODO this is wrong. we should not replcae this, we should recursively update it
    selfConf = MergeRecursive(selfConf, aConf)
    logger.info('Reading selfConf from command line')
    // TODO use MergeRecursive function to get rid of this shitty code
    let args = argParser.xyzGeneric()
    for (let arg in args) {
      let keys = arg.split('.')
      if (keys.length === 1) {
        if (keys[0] === 'seed')
          selfConf[keys[0]].push(args[arg])
        else
          selfConf[keys[0]] = args[arg]
      }
      else if (keys.length === 2) {
        if (! selfConf[keys[0]]) selfConf[keys[0]] = {}
        selfConf[keys[0]][keys[1]] = args[arg]
      }
      else if (keys.length === 3) {
        if (! selfConf[keys[0]]) selfConf[keys[0]] = {}
        if (! selfConf[keys[1]]) selfConf[keys[1]] = {}
        selfConf[keys[0]][keys[1]][keys[2]] = args[arg]
      } else {
        logger.error('command line arguments with more than three sub-keys are not allowed. passing')
      }
    }

    logger.transports.console.level = selfConf.logLevel || 'info'
    logger.info(`log level set to ${logger.transports.console.level}`)

    logger.debug('final configurations for selfConf is:')
    console.log(selfConf)
  },

  setSystemConf: (aConf) => {
    logger.info('Setting default systemConf')
    systemConf = CONSTANTS.defaultConfig.systemConf
    logger.info('reading systemConf from user')
    systemConf = aConf

    logger.debug(`Adding self to systemConf by default`)
    if (systemConf.microservices.indexOf(`${selfConf.host}:${selfConf.port}`) === -1) {
      logger.info('final configurations for systemConf is:')
      systemConf.microservices.push(`${selfConf.host}:${selfConf.port}`)
    }
    console.log(systemConf)
  },

  getSystemConf: () => systemConf,
  getSelfConf: () => selfConf
}

module.exports = configuration
