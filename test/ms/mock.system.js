const fs = require('fs')

class MockSystem {
  constructor (cwd) {
    this.microservices = []
    this.cwd = cwd
  }

  addMicroservice (ms) {
    this.microservices.push(ms)
  }

  getSystemConf () {
    return {
      microservices: this.microservices
    }
  }
}

module.exports = MockSystem
