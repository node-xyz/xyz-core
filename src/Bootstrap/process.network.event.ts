/** @module bootstrapFunctions */

/**
* will setup a message listener for the process to responde to `network` event
* This will be used by xyz-cli. please see the source code for more information.
* @function _processNetworkEvent
* @param  {Object}   xyz   the automatically injected paramter referring to the current xyz instance.
*/

let load = {snd: 0, rcv: 0}
let _load = {snd: 0, rcv: 0}
const reset = 1000 // 2.5sec accuracy
export default function _processNetworkEvent (xyz) {
  // count receives
  xyz.serviceRepository.on('message:receive', () => {
    load.rcv += 1
  })

  // count sends
  xyz.serviceRepository.on('message:send', () => {
    load.snd += 1
  })

  // answer to message
  process.on('message', (data) => {
    if (data.title === 'network') {
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
