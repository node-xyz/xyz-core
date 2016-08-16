module.exports = {
  commandline: {
    xyzport: 3000
  },
  events: {
    REQUEST: 'request',
    SERVICE_CALL: 'serviceCall',
    PING: "ping"
  },
  url: {
    CALL: 'call',
    PING: 'ping'
  },
  intervals: {
    threshold: 1000,
    ping: 5000
  },
  environmet: {
    dev: "dev",
    production: "prod"
  }
};
