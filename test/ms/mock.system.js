const fs = require('fs');

class MockSystem {
  constructor(cwd) {
    this.microservices = [];
    this.cwd = cwd;
  }

  addMicroservice(ms) {
    this.microservices.push(ms);
  }

  write() {
    fs.writeFileSync(`${this.cwd}/xyzTest.json`, JSON.stringify({
      microservices: this.microservices
    }))
  }
}

module.exports = MockSystem;
