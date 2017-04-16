var machineReporter = {
    getCPU: function () { return process.cpuUsage(); },
    getMem: function () { return process.memoryUsage(); },
    PID: function () { return process.pid; }
};
module.exports = machineReporter;
