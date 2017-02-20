// a set of constant variables. used as fallback for configurations filled by the user.
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
    CALL: 'CALL',
    PING: 'PING',
    JOIN: 'JOIN'
  },
  environmet: {
    dev: 'dev',
    production: 'prod'
  },

  // the default configuration. the will be merged recursively with
  // the object passed by the user.
  defaultConfig: {
    selfConf: {
      // name of the service. used in logs etc.
      name: 'node-xyz-init',
      // the default middleware funciton used with `.call(...)`
      defaultSendStrategy: 'xyz.service.send.first.find',
      // log level used by winston
      logLevel: 'info',
      // default seed nodes
      seed: [],
      // default transport layer service
      transport: [
        {type: 'HTTP', port: '4000', event: 1}
      ],
      // ip
      host: '127.0.0.1',

      intervals: {
        // interval for connecting to seed nodes.
        // sed only when `seed` is not an empty list
        reconnect: 2500
      },
      // the default bootstrap function. Will lunch the default ping bootstrap for service discovery
      defaultBootstrap: true,
      // used only when lunching with ci
      cli: {
        // this will cause the current node process to send a message to its
        // parent process, indicating that it has successfully lunched .
        enable: false,
        // the stdout destination with cli
        stdio: 'console'
      }
    },
    systemConf: {
      nodes: []
    }
  }
}
