let XYZ = require('./../../index')

let loadBalancer = new XYZ({
  selfConf: { logLevel: 'verbose', name: 'load.balancer', port: 5000, defaultSendStrategy: require('./round.robin.send')}
})

loadBalancer.bootstrap(require('./../../../xyz.monitor.basic.bootstrap').bootstrap, 0)

loadBalancer.register('/balance/roundrobin', (payload, response) => {
  loadBalancer.call({servicePath: payload.service}, (err, body) => {
    if (err) response.jsonify(err)
    else response.jsonify(body)
  })
})
