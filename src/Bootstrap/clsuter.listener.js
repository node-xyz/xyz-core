function clusterListener (xyz) {
  xyz.serviceRepository.on('cluster:join', () => {
    console.log(`joined cluster from event listener`)
  })

  xyz.serviceRepository.on('request:receive', (data) => {
    console.log('request received with' , data)
  })
}

module.exports = clusterListener
