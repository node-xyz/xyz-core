let CONSTANTS = require('./../Config/Constants');
let argParser = require('./../Util/commandline.parser');

let systemConf;
let serviceConf = {};

let environmet = (process.argv[2] == `--${CONSTANTS.environmet.dev}` ? 'dev' : 'prod');

let configuration = {
  setServiceConf: (aConf) => {
    if (aConf) {
      serviceConf = (environmet == 'dev' ? aConf.dev : aConf)
    } else {
      serviceConf.port = argParser.get('--xyzport');
      serviceConf.host = "http://0.0.0.0";
      serviceConf.name = process.argv[1];
    }
  },
  setSystemConf: (aConf) => {
    systemConf = (environmet == 'dev' ? aConf.dev : aConf)
  },

  getSystemConf: () => systemConf,
  getServiceConf: () => serviceConf,
}

module.exports = configuration;
