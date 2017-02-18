const XYZ = require('./../../index')

let client = new XYZ({
  selfConf: {name: 'client.ms', transport: [{type: 'HTTP', port: 4000}]},
  systemConf: {nodes: ['127.0.0.1:5000']}
})

setInterval(function () {
  client.call({servicePath: '/balance/roundrobin', payload: {service: '/task/io'}}, (err, body, response) => {
    console.log(err, body)
  })
}, 100)

console.log(client)
