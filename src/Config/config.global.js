let CONSTANTS = require('./../Config/Constants')
let argParser = require('./../Util/commandline.parser')
let logger = require('./../Log/Logger')

let systemConf
let selfConf = {}

function MergeRecursive (obj1, obj2) {
  for (var p in obj2) {
    try {
      if (obj2[p].constructor === Object) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p])
      } else {
        obj1[p] = obj2[p]
      }
    } catch (e) {
      obj1[p] = obj2[p]
    }
  }
  return obj1
}

let configuration = {
  joinNode: (aNode) => {
    if (systemConf.nodes.indexOf(aNode) > -1) {
      logger.warn(`Node ${aNode} already in systemConf. Passing.`)
    } else {
      logger.info(`A new node {${aNode}} added to systemConf`)
      systemConf.nodes.push(aNode)
    }
  },

  kickNode: (aNode) => {
    let index = systemConf.nodes.indexOf(aNode)
    if (index > -1) {
      systemConf.nodes.splice(systemConf.nodes.indexOf(aNode), 1)
    } else {
      logger.warn(`Attempting to remove ${aNode} which does not exist`)
    }
  },

  /**
   * a Duplicate function to joinNode. The only difference is logging and the fact
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

  setSelfConf: (aConf, cmdLineArgs) => {
    logger.info('Setting default selfConf')
    selfConf = CONSTANTS.defaultConfig.selfConf
    logger.info('Reading selfConf from user')
    selfConf = MergeRecursive(selfConf, aConf)
    logger.info('Reading selfConf from command line')
    // TODO use MergeRecursive function to get rid of this shitty code

    // this is to allow cli admin to inject some args like commandline arguments
    let args = cmdLineArgs ? cmdLineArgs : argParser.xyzGeneric()
    for (let arg in args) {
      logger.verbose(`overriding ${arg} from command line value {${args[arg]}}`)
      let keys = arg.split('.')
      if (keys.length === 1) {
        if (keys[0] === 'seed') { selfConf[keys[0]].push(args[arg]) } else if (keys[0] === 'allowJoin') {
          // could also use eval here
          if (args[arg] === '0' || args[arg] === 'false') {
            selfConf[keys[0]] = false
          } else {
            selfConf[keys[0]] = true
          }
        } else {
          selfConf[keys[0]] = args[arg]
        }
      } else if (keys.length === 2) {
        if (!selfConf[keys[0]]) selfConf[keys[0]] = {}
        selfConf[keys[0]][keys[1]] = keys[1] === 'enable' ? eval(args[arg]) : args[arg]
      } else if (keys.length === 3) {
        if (!selfConf[keys[0]]) selfConf[keys[0]] = {}
        if (!selfConf[keys[1]]) selfConf[keys[1]] = {}
        selfConf[keys[0]][keys[1]][keys[2]] = args[arg]
      } else {
        logger.error('command line arguments with more than three sub-keys are not allowed. passing')
      }
    }

    logger.transports.console.level = selfConf.logLevel
    logger.debug(`log level set to ${logger.transports.console.level}`)
  },

  setSystemConf: (aConf) => {
    logger.info('Setting default systemConf')
    systemConf = CONSTANTS.defaultConfig.systemConf
    logger.info('reading systemConf from user')
    systemConf = MergeRecursive(systemConf, aConf)
    logger.info('Reading selfConf from command line')
    let args = argParser.xyzGeneric('--xys-')
    for (let arg in args) {
      logger.verbose(`overriding ${arg} from command line value {${args[arg]}}`)
      if (arg === 'node') {
        systemConf.nodes.push(args[arg])
      }
    }

    logger.debug('Adding self to systemConf by default')
    if (systemConf.nodes.indexOf(`${selfConf.host}:${selfConf.transport[0].port}`) === -1) {
      systemConf.nodes.push(`${selfConf.host}:${selfConf.transport[0].port}`)
    }
  },

  addServer: (aServer) => {
    for (let s of selfConf.transport) {
      if (s.port === aServer.port) {
        logger.error(`cannot add a server with port ${aServer.port} to selfConf. already exists`)
        return false
      }
    }
    logger.info(`new server ${JSON.stringify(aServer)} added at runtime to selfConf`)
    selfConf.transport.push(aServer)
  },

  getSystemConf: () => systemConf,

  getSelfConf: () => selfConf
}

module.exports = configuration
