
export default  {
  getCPU: () => process.cpuUsage(),
  getMem: () => process.memoryUsage(),
  PID: () => process.pid
}
