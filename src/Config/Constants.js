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
    PING: "ping",
    EVENT_PREFIX: "_"
  },
  url: {
    CALL: 'call',
    PING: 'ping'
  },
  intervals: {
    threshold: 5000,
    ping: 10000,
  },
  environmet: {
    dev: "dev",
    production: "prod"
  }
}
