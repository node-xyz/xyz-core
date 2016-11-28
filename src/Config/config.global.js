let CONSTANTS = require('./../Config/Constants')
let argParser = require('./../Util/commandline.parser')
let logger = require('./../Log/Logger')

let systemConf
let selfConf = {}

let configuration = {
  joinNode: (aNode) => {
    for (let node of systemConf.microservices) {
      if (node === aNode) {
        logger.error(`node already exists. Not adding ${JSON.stringify(aNode)}`)
        return
      }
    }
    systemConf.microservices.push(aNode)
  },

  removeNode: (aNode) => {
    systemConf.microservices.splice(systemConf.microservices.indexOf(aNode), 1)
    console.log(systemConf.microservices)
  },

  setSelfConf: (aConf) => {
    logger.info('Setting default config')
    selfConf = CONSTANTS.defaultConfig.selfConf
    logger.info('Reading system Conf from user')
    selfConf = aConf
    logger.info('Reading system Conf from command line')
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
    systemConf = aConf
  },

  ensureSelf: () => {
    for (let node of systemConf.microservices) {
      if (node === `${selfConf.host}:${selfConf.port}`) {
        logger.info(`Self node exists in systemConf. passing`)
        return
      }
    }
    systemConf.microservices.push(`${selfConf.host}:${selfConf.port}`)
    logger.info(`Adding self to systemConf by default`)
  },

  getSystemConf: () => systemConf,
  getSelfConf: () => selfConf
}

module.exports = configuration
