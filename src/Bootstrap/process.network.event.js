let load = {snd: 0, rcv: 0}
let _load = {snd: 0, rcv: 0}
const reset = 2500 // 2.5sec accuracy
function processNetworkEvent (xyz) {
  // count receives
  xyz.serviceRepository.on('message:receive', () => {
    console.log('received')
    load.rcv += 1
  })

  // count sends
  xyz.serviceRepository.on('message:send', () => {
    load.snd += 1
  })

  // answer to message
  process.on('message', (data) => {
    if (data.title == 'network') {
      process.send({title: data.title, body: _load})
    }
  })

  setInterval(() => {
    _load.snd = load.snd / (reset / 1000)
    _load.rcv = load.rcv / (reset / 1000)
    load.snd = 0
    load.rcv = 0
  }, reset)
}

module.exports = processNetworkEvent
