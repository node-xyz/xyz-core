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
  intervals: {
    threshold: 5000,
    ping: 10000,
    reconnect: 2500,
    KICK: 5
  },
  environmet: {
    dev: 'dev',
    production: 'prod'
  },
  defaultConfig: {
    selfConf: {
      name: 'node-xyz-init',
      seed: [],
      port: 3333,
      host: '127.0.0.1'
    },
    systemConf: {
      microservices: []
    }
  }
}
