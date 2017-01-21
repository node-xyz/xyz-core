
let machineReporter = {
  getCPU: () => process.cpuUsage(),
  getMem: () => process.getMemoryUsage()
  PID: () => process.pid
}

module.exports = machineReporter;
