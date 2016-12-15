/**
 * a set of constant variables. used as fallback for configurations filled by the user.
 */
module.exports = {
  commandline: {
    xyzport: 3000
  },
  events: {
    REQUEST: 'request',
    SERVICE_CALL: 'serviceCall',
    PING: 'ping',
    JOIN: 'join'
  },
  url: {
    CALL: 'call',
    PING: 'ping',
    JOIN: 'join'
  },
  environmet: {
    dev: 'dev',
    production: 'prod'
  },
  defaultConfig: {
    selfConf: {
      name: 'node-xyz-init',
      defaultSendStrategy: 'xyz.service.send.first.find',
      allowJoin: false,
      logLevel: 'info',
      seed: [],
      port: 3333,
      host: '127.0.0.1',
      intervals: {
        // threshold: 5000,
        // ping: 3000,
        // kick: 5,
        reconnect: 2500
      },
      defaultBootstrap: true
    },
    systemConf: {
      nodes: []
    }
  }
}
