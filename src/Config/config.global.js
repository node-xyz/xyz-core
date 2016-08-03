let systemConf;
let serviceConf;

let configuration = {
  setServiceConf: (aConf) => {
    serviceConf = aConf
  },
  setSystemConf: (aConf) => {
    systemConf = aConf
  },

  getSystemConf: () => systemConf,
  getServiceConf: () => serviceConf,
}

module.exports = configuration;
