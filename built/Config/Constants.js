Object.defineProperty(exports, '__esModule', { value: true })
/**
 * A set of constant values stored in xyz-core
 * @type {Object}
 */
exports.CONSTANTS = {
    /**
     * name of the events emiited by xyz
     * @type {Object}
     */
  events: {
    MESSAGE: 'xyz_message',
    PING: 'xyz_ping'
  },
  url: {
    CALL: 'CALL',
    PING: 'PING',
    JOIN: 'JOIN'
  },
    /**
     *
     * the default configuration. the will be merged recursively with
     * the object passed by the user.
     * @type {Object}
     */
  defaultConfig: {
    selfConf: {
            // name of the service. used in logs etc.
      name: 'node-xyz-init',
            // the default middleware funciton used with `.call(...)`
      defaultSendStrategy: './Middleware/service.first.find',
            // log level used by winston
      logLevel: 'info',
            // default seed nodes
      seed: [],
            // default transport layer service
      transport: [
                { type: 'HTTP', port: 4000, event: true }
      ],
            // ip
      host: '127.0.0.1',
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
