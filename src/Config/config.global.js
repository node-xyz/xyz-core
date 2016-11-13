let CONSTANTS = require('./../Config/Constants')
let argParser = require('./../Util/commandline.parser')
let logger = require('./../Log/Logger')

let systemConf
let selfConf = {}

let configuration = {
  joinNode: (aNode) => {
    for (let node of systemConf.microservices) {
      if (`${node.host}:${node.port}` === `${aNode.host}:${aNode.port}`) {
        logger.error(`node already exists. Not adding ${JSON.stringify(aNode)}`)
      }
    }
    systemConf.microservices.push({host: aNode.host, port: aNode.port})
  },

  setSelfConf: (aConf) => {
    logger.info('Reading system Conf from json file')
    selfConf = aConf
    logger.info('Reading system Conf from command line')
    if (argParser.has('--xyzport')) selfConf.port = argParser.get('--xyzport')
    if (argParser.has('--xyzhost')) selfConf.host = argParser.get('--xyzhost')
    if (argParser.has('--xyzname')) selfConf.name = process.argv[1].slice(process.argv[1].lastIndexOf('/') + 1)
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
