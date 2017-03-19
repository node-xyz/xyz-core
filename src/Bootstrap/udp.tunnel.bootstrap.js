const _udpEvent = require('./../Transport/Middlewares/call/udp.receive.event')
const _udpExport = require('./../Transport/Middlewares/call/udp.export.middleware')

function _udpTunnel (xyz, config) {
  config = config || {}
  let route = config.route || 'UDP_CALL'
  let port = config.port || xyz.id().port + 10

  const logger = xyz.logger

  // server side
  xyz.registerServer('UDP', port)
  xyz.registerServerRoute(port, route)
  xyz.middlewares().transport.server(route)(port).register(0, _udpEvent)

  // client side
  xyz.registerClientRoute(route)
  xyz.middlewares().transport.client(route).register(0, _udpExport)

  logger.info(`UDP TUNNEL :: Udp tunnel created with route ${route} | port ${port}`)
}

module.exports = _udpTunnel
