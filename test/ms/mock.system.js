const fs = require('fs')

class MockSystem {
  constructor (cwd) {
    this.nodes = []
    this.cwd = cwd
  }

  addNode (ms) {
    this.nodes.push(ms)
  }

  getSystemConf () {
    return {
      nodes: this.nodes
    }
  }
}

module.exports = MockSystem
