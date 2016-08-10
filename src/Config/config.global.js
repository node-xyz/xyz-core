let CONSTANTS = require('./../Config/Constants');

let systemConf;
let serviceConf;

let environmet = (process.argv[2] == `--${CONSTANTS.environmet.dev}` ? 'dev' : 'prod');

let configuration = {
  setServiceConf: (aConf) => {
    serviceConf = (environmet == 'dev' ? aConf.dev : aConf)
  },
  setSystemConf: (aConf) => {
    systemConf = (environmet == 'dev' ? aConf.dev : aConf)
  },

  getSystemConf: () => systemConf,
  getServiceConf: () => serviceConf,
}

module.exports = configuration;
