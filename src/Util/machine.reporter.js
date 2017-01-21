
let machineReporter = {
  getCPU: () => process.cpuUsage(),
  getMem: () => process.memoryUsage(),
  PID: () => process.pid
}

module.exports = machineReporter
