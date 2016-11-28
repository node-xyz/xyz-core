let CONSTANTS = require('./../Config/Constants')
let argParser = require('./../Util/commandline.parser')
let logger = require('./../Log/Logger')

let systemConf
let selfConf = {}

let configuration = {
  joinNode: (aNode) => {
    logger.debug(`Joining node ${JSON.stringify(aNode)}`)
    for (let node of systemConf.microservices) {
      if (`${node.host}:${node.port}` === `${aNode.host}:${aNode.port}`) {
        logger.error(`node already exists. Not adding ${JSON.stringify(aNode)}`)
        return
      }
    }
    systemConf.microservices.push({host: aNode.host, port: aNode.port})
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
      }else {
        logger.error('command line arguments with more than three sub-keys are not allowed. passing')
      }
    }

    logger.debug('final configurations for selfConf is:')
    console.log(selfConf)
  // if (argParser.has('--xyzport')) selfConf.port = argParser.get('--xyzport')
  // if (argParser.has('--xyzhost')) selfConf.host = argParser.get('--xyzhost')
  // if (argParser.has('--xyzname')) selfConf.name = process.argv[1].slice(process.argv[1].lastIndexOf('/') + 1)
  // if (argParser.has('--xyzseed')) {
  //   let seed = argParser.get('--xyzseed').split(':')
  //   selfConf.seed = [{host: seed[0], port: seed[1]}
  //   ]}
  },
  setSystemConf: (aConf) => {
    systemConf = aConf
    if (argParser.has('--xyzdev')) {
      systemConf.microservices = systemConf.microservices.map((ms) => {
        ms.host = '127.0.0.1'
        return ms
      })
    }
  },

  ensureSelf: () => {
    for (let node of systemConf.microservices) {
      if (node.host === selfConf.host && node.port === selfConf.port) {
        logger.info(`Self node exists in systemConf. passing`)
        return
      }
    }
    systemConf.microservices.push({
      host: selfConf.host,
      port: selfConf.port
    })
    logger.info(`Adding self to systemConf by default`)
  },

  getSystemConf: () => systemConf,
  getSelfConf: () => selfConf
}

module.exports = configuration
