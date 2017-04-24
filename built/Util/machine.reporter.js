Object.defineProperty(exports, '__esModule', { value: true })
exports.default = {
  getCPU: function () { return process.cpuUsage() },
  getMem: function () { return process.memoryUsage() },
  PID: function () { return process.pid }
}
