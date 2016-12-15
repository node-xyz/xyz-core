function clusterListener (xyz) {
  xyz.serviceRepository.on('cluster:join', () => {
    console.log(`joined cluster from event listener`)
  })

  xyz.serviceRepository.on('requests:receive', (data) => {
    console.console.log('request received with' , data)
  })
}

module.exports = clusterListener
