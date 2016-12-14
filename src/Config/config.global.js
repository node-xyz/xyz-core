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
    if (systemConf.nodes.indexOf(aNode) > -1) {
      logger.warn(`Node ${aNode} already in systemConf. Passing.`)
    }
    logger.info(`A new node {${aNode}} added to systemConf`)
    systemConf.nodes.push(aNode)
  },

  kickNode: (aNode) => {
    let index = systemConf.nodes.indexOf(aNode)
    if (index > -1)
      systemConf.nodes.splice(systemConf.nodes.indexOf(aNode), 1)
    else
      logger.warn(`Attempting to remove ${aNode} which does not exist`)
  },

  /**
   * a Duplicate function to joinNode. The inly difference is logging and the fact
   * that this one takes an array of nodes
   * @param  {String} someNodes a list of nodes
   */
  ensureNodes: (someNodes) => {
    for (let aNode of someNodes) {
      if (systemConf.nodes.indexOf(aNode) === -1) {
        logger.info(`A new node {${aNode}} added to systemConf`)
        systemConf.nodes.push(aNode)
      }
    }
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
      logger.verbose(`overriding ${arg} from command line`)
      let keys = arg.split('.')
      if (keys.length === 1) {
        if (keys[0] === 'seed')
          selfConf[keys[0]].push(args[arg])
        else if (keys[0] == 'allowJoin') {
          if (args[arg] === '0' || args[arg] === 'false') {
            selfConf[keys[0]] = false
          }else {
            selfConf[keys[0]] = true
          }
        }
        else
          selfConf[keys[0]] = args[arg]
      }
      else if (keys.length === 2) {
        if (! selfConf[keys[0]]) selfConf[keys[0]] = {}
        selfConf[keys[0]][keys[1]] = eval(args[arg])
      }
      else if (keys.length === 3) {
        if (! selfConf[keys[0]]) selfConf[keys[0]] = {}
        if (! selfConf[keys[1]]) selfConf[keys[1]] = {}
        selfConf[keys[0]][keys[1]][keys[2]] = args[arg]
      } else {
        logger.error('command line arguments with more than three sub-keys are not allowed. passing')
      }
    }

    logger.transports.console.level = selfConf.logLevel
    logger.info(`log level set to ${logger.transports.console.level}`)

    logger.debug('final configurations for selfConf is:')
    console.log(selfConf)

  // TODO : fix this. this is temporarly to improve our test case
  },

  setSystemConf: (aConf) => {
    logger.info('Setting default systemConf')
    systemConf = CONSTANTS.defaultConfig.systemConf
    logger.info('reading systemConf from user')
    systemConf = aConf

    logger.debug(`Adding self to systemConf by default`)
    if (systemConf.nodes.indexOf(`${selfConf.host}:${selfConf.port}`) === -1) {
      systemConf.nodes.push(`${selfConf.host}:${selfConf.port}`)
    }
    logger.info('final configurations for systemConf is:')
    console.log(systemConf)
  },

  getSystemConf: () => systemConf,
  getSelfConf: () => selfConf
}

module.exports = configuration
