let CONSTANTS = require('./../Config/Constants')
let argParser = require('./../Util/commandline.parser')
let logger = require('./../Log/Logger')

let systemConf
let serviceConf = {}


let configuration = {
  setServiceConf: (aConf) => {
    if (aConf) {
      logger.info('Reading system Conf from json file')
      serviceConf = aConf
    } else {
      logger.info('Reading system Conf from command line')
      serviceConf.port = argParser.get('--xyzport')
      serviceConf.host = argParser.get('--xyzhost')
      serviceConf.name = process.argv[1].slice(process.argv[1].lastIndexOf('/') + 1)
    }
  },
  setSystemConf: (aConf) => {
    systemConf = aConf
    if (argParser.has('--xyzdev')) {
      systemConf.microservices = systemConf.microservices.map((ms) => {
        ms.host = "http://0.0.0.0"
        return ms
      })
    }
  },

  getSystemConf: () => systemConf,
  getServiceConf: () => serviceConf,
}

module.exports = configuration
