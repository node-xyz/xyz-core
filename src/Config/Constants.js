/**
 * Created by Kian on 7/22/16.
 */

module.exports = {
  http: {
    port: 3333,
    host: "0.0.0.0"
  },
  tcp: {
    port: 3333
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
    ping : 5000
  }
};
